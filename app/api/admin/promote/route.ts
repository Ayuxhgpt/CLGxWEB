import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.role = 'admin';
        await user.save();

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
