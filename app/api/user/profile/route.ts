import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { bio, socials, image, year } = await req.json();

        await dbConnect();

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                bio,
                socials,
                image,
                year
            },
            { new: true }
        );

        return NextResponse.json({ message: 'Profile updated', user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email }).select('-password');

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
