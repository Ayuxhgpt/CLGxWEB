import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

        // Cannot modify self
        if (targetUser._id.toString() === adminUser.id) {
            return NextResponse.json({ message: 'You cannot modify your own account' }, { status: 400 });
        }

        // Cannot Block/Demote other Admins (Prevent War)
        // Optionally allow Super Admins, but for now, prevent admin-on-admin violence for safety
        if (targetUser.role === 'admin' && (action === 'BLOCK' || action === 'DEMOTE')) {
            // Check if there are other admins? 
            // Simplified rule: Only allow if multiple admins exist? 
            // For now: Just allow it but with caution. User spec says: "Cannot demote last remaining admin"

            if (action === 'DEMOTE') {
                const adminCount = await User.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    return NextResponse.json({ message: 'Cannot demote the last admin' }, { status: 400 });
                }
            }
        }

        // 3. Execute Action
        let updateData: any = {};
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
