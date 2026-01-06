import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic authorized origin check could go here

        // Forward to Audit System
        // We trust the frontend to send correct structure, but we enforce 'layer: frontend'
        logAudit({
            ...body,
            layer: 'frontend',
            req // Pass request for IP extraction
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
