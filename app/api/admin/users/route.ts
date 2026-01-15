
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    try {
        const session = await getServerSession(authOptions);

        // Security Check
        if (!session || (session.user as any).role !== 'admin') {
            logAudit({
                domain: 'ADMIN',
                action: 'USER_LIST_UNAUTHORIZED',
                result: 'FAIL',
                errorCategory: 'AUTH',
                errorMessage: 'Unauthorized access',
                requestId
            });
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');
        const status = searchParams.get('status'); // active | blocked
        const skip = (page - 1) * limit;

        // Build Query
        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        if (status) {
            if (status === 'blocked') query.isBlocked = true;
            if (status === 'active') query.isBlocked = false;
        }

        // Execute Query
        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -otp -otpExpiry -otpHash') // Exclude sensitive
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Log Search/View (Only if searching or specialized view to avoid noise on simple page loads?)
        // Let's log 'ADMIN_USER_LIST_VIEW'
        logAudit({
            domain: 'ADMIN',
            action: 'ADMIN_USER_LIST_VIEW',
            result: 'SUCCESS',
            metadata: { page, limit, search, role, status, count: users.length },
            requestId,
            durationMs: Date.now() - startTime
        });

        return NextResponse.json({
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });

    } catch (error: any) {
        console.error('Admin Users API Error:', error);
        logAudit({
            domain: 'ADMIN',
            action: 'ADMIN_USER_LIST_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        logAudit({
            domain: 'ADMIN',
            action: 'USER_UPDATE_UNAUTHORIZED',
            result: 'FAIL',
            errorCategory: 'AUTH',
            errorMessage: 'Unauthorized attempt to update user',
            requestId
        });
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { userId, action, role } = body;
        // action: 'block' | 'unblock' | 'role_update'

        await dbConnect();
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // 3.1 SUPER ADMIN CHECK for Role Changes
        if (action === 'role_update') {
            const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
            // Only Super Admin can change roles
            if (!superAdminEmail || session.user.email !== superAdminEmail) {
                logAudit({
                    domain: 'ADMIN',
                    action: 'ROLE_CHANGE_DENIED',
                    result: 'FAIL',
                    errorCategory: 'POLICY',
                    errorMessage: 'Only Super Admin can change roles',
                    userId: (session.user as any).id,
                    targetId: userId,
                    requestId
                });
                return NextResponse.json({ success: false, message: 'Only Super Admin can change user roles.' }, { status: 403 });
            }

            // Cannot demote Super Admin
            if (targetUser.email === superAdminEmail && role !== 'admin') {
                return NextResponse.json({ success: false, message: 'Cannot demote Super Admin.' }, { status: 403 });
            }

            // Prevent self-demotion
            if (userId === (session.user as any).id && role !== 'admin') {
                return NextResponse.json({ success: false, message: 'Cannot demote yourself.' }, { status: 403 });
            }

            const oldRole = targetUser.role;
            targetUser.role = role; // 'admin' or 'student'
            await targetUser.save();

            logAudit({
                domain: 'ADMIN',
                action: 'USER_ROLE_UPDATED',
                result: 'SUCCESS',
                userId: (session.user as any).id,
                targetId: userId,
                metadata: { oldRole, newRole: role },
                requestId
            });

            return NextResponse.json({ success: true, message: `User role updated to ${role}` });
        }

        if (action === 'block' || action === 'unblock') {
            const isBlocked = action === 'block';

            // Prevent blocking Super Admin
            if (targetUser.email === process.env.SUPER_ADMIN_EMAIL) {
                return NextResponse.json({ success: false, message: 'Cannot block Super Admin.' }, { status: 403 });
            }

            // Prevent blocking Self
            if (userId === (session.user as any).id) {
                return NextResponse.json({ success: false, message: 'Cannot block yourself.' }, { status: 403 });
            }

            targetUser.isBlocked = isBlocked;
            await targetUser.save();

            logAudit({
                domain: 'ADMIN',
                action: isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
                result: 'SUCCESS',
                userId: (session.user as any).id,
                targetId: userId,
                requestId
            });

            return NextResponse.json({ success: true, message: `User ${isBlocked ? 'blocked' : 'unblocked'}` });
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error(error);
        logAudit({
            domain: 'ADMIN',
            action: 'USER_UPDATE_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId
        });
        return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
    }
}
