import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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
        const { action } = body; // PROMOTE, DEMOTE, BLOCK, UNBLOCK

        if (!action) return NextResponse.json({ message: 'Action required' }, { status: 400 });

        await dbConnect();
        const targetUser = await User.findById(id);

        if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // 2. Safety Rules

        const SUPER_ADMIN = 'AyushGPT@gmail.com';  // Case-sensitive as stored? Ideally normalize.
        // Assuming email is stored as is, but logic usually normalizes. 
        // Let's implement case-insensitive check for reliability.

        // Cannot modify self
        if (targetUser._id.toString() === adminUser.id) {
            return NextResponse.json({ message: 'You cannot modify your own account' }, { status: 400 });
        }

        // PROTECTION: SUPER ADMIN CANNOT BE TOUCHED
        if (targetUser.email.toLowerCase() === SUPER_ADMIN.toLowerCase()) {
            return NextResponse.json({ message: 'Super Admin cannot be modified' }, { status: 403 });
        }

        // AUTHORITY: ONLY SUPER ADMIN CAN PROMOTE/DEMOTE ADMINS
        if (action === 'PROMOTE' || action === 'DEMOTE') {
            if (adminUser.email.toLowerCase() !== SUPER_ADMIN.toLowerCase()) {
                return NextResponse.json({ message: 'Only Super Admin can manage admin roles' }, { status: 403 });
            }
        }

        // Cannot Block/Demote other Admins (Prevent War)
        if (targetUser.role === 'admin' && (action === 'BLOCK' || action === 'DEMOTE')) {
            if (action === 'DEMOTE' || action === 'BLOCK') {
                const adminCount = await User.countDocuments({ role: 'admin' });
                // If blocking an admin, we must treat them as 'removed' from active duty? 
                // Effectively yes. If only 1 admin exists and we block them, no one can login as admin.
                if (adminCount <= 1 && (action === 'DEMOTE' || (action === 'BLOCK' && !targetUser.isBlocked))) {
                    return NextResponse.json({ message: 'Cannot demote or block the last admin' }, { status: 400 });
                }
            }
        }

        // 3. Execute Action
        let updateData: { role?: string, isBlocked?: boolean } = {};
        let logMessage = '';

        switch (action) {
            case 'PROMOTE':
                updateData = { role: 'admin' };
                logMessage = `Promoted to Admin`;
                break;
            case 'DEMOTE':
                updateData = { role: 'student' };
                logMessage = `Demoted to Student`;
                break;
            case 'BLOCK':
                updateData = { isBlocked: true };
                logMessage = `Blocked User`;
                break;
            case 'UNBLOCK':
                updateData = { isBlocked: false };
                logMessage = `Unblocked User`;
                break;
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        await User.findByIdAndUpdate(id, updateData);

        // TODO: Add Audit Log here if Audit Model exists

        return NextResponse.json({
            message: `Success: ${logMessage}`,
            user: { ...targetUser.toObject(), ...updateData }
        });

    } catch (error) {
        console.error('Admin User Action Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
