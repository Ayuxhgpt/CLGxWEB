import { NextAuthOptions } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
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

                // Verify password (if user exists)
                const isValid = user && user.password && await bcrypt.compare(credentials.password, user.password);

                // Generic error to prevent enumeration
                if (!user || !isValid) {
                    throw new Error('Invalid email or password');
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
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider === 'google' || account?.provider === 'github') {
                    await dbConnect();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create new user for social login
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            provider: account.provider,
                            providerId: account.providerAccountId,
                            isVerified: true, // Auto-verify social logins
                            password: '', // No password for social
                        });
                    } else {
                        // Link or update existing user
                        if (!existingUser.provider) {
                            existingUser.provider = account.provider;
                            existingUser.providerId = account.providerAccountId;
                            if (user.image) existingUser.image = user.image;
                            await existingUser.save();
                        }
                    }
                }
                return true;
            } catch (error) {
                console.error("Social Signin Error:", error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role || 'student';
                token.id = user.id;
                token.isBlocked = user.isBlocked;
                token.picture = user.image;
            }
            // Fetch latest role/block status on every JWT update to be safe
            if (token.id) {
                await dbConnect();
                const freshUser = await User.findById(token.id).select('role isBlocked image');
                if (freshUser) {
                    token.role = freshUser.role;
                    token.isBlocked = freshUser.isBlocked;
                    token.picture = freshUser.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.isBlocked = token.isBlocked;
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
