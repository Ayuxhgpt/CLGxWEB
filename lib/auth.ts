import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password');
                }

                await dbConnect();

                // Find user
                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error('User not found');
                }

                // Verify password
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error('Invalid password');
                }

                if (!user.isVerified) {
                    throw new Error('Email not verified. Please verify your email.');
                }

                if (user.isBlocked) {
                    throw new Error('Account blocked. Contact admin.');
                }

                // Update last login (fire and forget to avoid blocking login)
                User.updateOne({ _id: user._id }, { lastLogin: new Date() }).exec();

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                    isBlocked: user.isBlocked,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user: u }) {
            const user = u as any;
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.isBlocked = user.isBlocked;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).isBlocked = token.isBlocked;
                if (token.picture) session.user.image = token.picture;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login', // Error code passed in query string as ?error=
    },
    session: {
        strategy: 'jwt',
    },
    // Fallback included to prevent build failures if env is missing.
    // In production, the actual env var will override this (or should be set).
    secret: process.env.NEXTAUTH_SECRET || 'build-time-placeholder-secret',
};
