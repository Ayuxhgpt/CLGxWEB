import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

type UserAction = 'PROMOTE' | 'DEMOTE' | 'BLOCK' | 'UNBLOCK';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const adminUser = session?.user as any;

        // 1. Auth Guard
        if (!session || adminUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const action: UserAction = body.action;

        const VALID_ACTIONS: UserAction[] = ['PROMOTE', 'DEMOTE', 'BLOCK', 'UNBLOCK'];
        if (!VALID_ACTIONS.includes(action)) {
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        await dbConnect();
        const targetUser = await User.findById(id);

        if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // 2. Safety Rules

        // Env Variable with Fallback
        const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'AyushGPT@gmail.com').toLowerCase();
        const isSuperAdmin = adminUser.email.toLowerCase() === SUPER_ADMIN_EMAIL;
        const isTargetSuperAdmin = targetUser.email.toLowerCase() === SUPER_ADMIN_EMAIL;

        // RULE A: Admin cannot block self
        if (targetUser._id.toString() === adminUser.id && (action === 'BLOCK' || action === 'DEMOTE')) {
            return NextResponse.json({ message: 'You cannot block or demote your own account' }, { status: 400 });
        }

        // RULE B: Super Admin Immunity
        if (isTargetSuperAdmin) {
            return NextResponse.json({ message: 'Super Admin cannot be modified' }, { status: 403 });
        }

        // RULE C: Only Super Admin can promote/demote admins
        if (action === 'PROMOTE' || action === 'DEMOTE') {
            if (!isSuperAdmin) {
                return NextResponse.json({ message: 'Only Super Admin can manage admin roles' }, { status: 403 });
            }
        }

        // RULE D: Cannot Block/Demote the LAST Admin
        // This applies if the target is an admin and the action removes their admin capability (BLOCK or DEMOTE)
        if (targetUser.role === 'admin' && (action === 'BLOCK' || action === 'DEMOTE')) {
            const adminCount = await User.countDocuments({ role: 'admin', isBlocked: false });
            // If we are about to remove an admin, and count is 1, strictly forbid.
            // Note: If we are blocking, we check if they are currently unblocked. 
            // If we are demoting, we check if they are currently admin.

            // Optimization: We already know targetUser.role === 'admin'.
            // If action is BLOCK and they are seemingly active...
            // Or if action is DEMOTE...

            if (adminCount <= 1) {
                return NextResponse.json({ message: 'Cannot remove the last active admin' }, { status: 400 });
            }
        }

        // 3. Idempotency & Execution
        let updateData: { role?: string, isBlocked?: boolean } = {};
        let logMessage = '';

        switch (action) {
            case 'PROMOTE':
                if (targetUser.role === 'admin') {
                    return NextResponse.json({ message: 'User is already an admin', user: targetUser });
                }
                updateData = { role: 'admin' };
                logMessage = `Promoted to Admin`;
                break;
            case 'DEMOTE':
                if (targetUser.role !== 'admin') {
                    return NextResponse.json({ message: 'User is not an admin', user: targetUser });
                }
                updateData = { role: 'student' };
                logMessage = `Demoted to Student`;
                break;
            case 'BLOCK':
                if (targetUser.isBlocked) {
                    return NextResponse.json({ message: 'User is already blocked', user: targetUser });
                }
                updateData = { isBlocked: true };
                logMessage = `Blocked User`;
                break;
            case 'UNBLOCK':
                if (!targetUser.isBlocked) {
                    return NextResponse.json({ message: 'User is already active', user: targetUser });
                }
                updateData = { isBlocked: false };
                logMessage = `Unblocked User`;
                break;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json({
            message: `Success: ${logMessage}`,
            user: updatedUser
        });

    } catch (error) {
        console.error('Admin User Action Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
