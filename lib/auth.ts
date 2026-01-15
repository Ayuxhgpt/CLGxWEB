import { NextAuthOptions } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

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
                    throw new Error('Please provide email/username and password');
                }

                await dbConnect();

                // Find user by Email OR Username
                const identifier = credentials.email.toLowerCase(); // 'email' field in creds carries the input
                const user = await User.findOne({
                    $or: [
                        { email: identifier },
                        { username: identifier }
                    ]
                });

                // Verify password (if user exists)
                const isValid = user && user.password && await bcrypt.compare(credentials.password, user.password);

                // Generic error to prevent enumeration
                // Generic error to prevent enumeration
                if (!user || !isValid) {
                    logAudit({
                        domain: 'AUTH',
                        action: 'LOGIN_FAILURE',
                        result: 'FAIL',
                        errorCategory: 'AUTH',
                        errorMessage: 'Invalid credentials',
                        metadata: { identifier }
                    });
                    throw new Error('Invalid credentials');
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
        async signIn({ user, account }) {
            try {
                await dbConnect();

                // 1. Check if user exists by email first (for ALL providers)
                const existingUser = await User.findOne({ email: user.email });

                // 2. BLOCK CHECK: If user exists and is blocked, DENY ACCESS IMMEDIATELY
                if (existingUser && existingUser.isBlocked) {
                    logAudit({
                        domain: 'AUTH',
                        action: 'LOGIN_BLOCKED',
                        result: 'FAIL',
                        errorCategory: 'POLICY',
                        errorMessage: 'User is blocked',
                        userId: existingUser._id.toString(),
                        userRole: existingUser.role,
                        targetType: 'user',
                        metadata: { email: user.email }
                    });
                    return false; // Redirects to error page
                }

                if (account?.provider === 'google' || account?.provider === 'github') {
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
                        logAudit({
                            domain: 'AUTH',
                            action: 'USER_REGISTERED_SOCIAL',
                            result: 'SUCCESS',
                            userRole: 'system',
                            targetType: 'user',
                            metadata: { email: user.email, provider: account.provider }
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
                logAudit({
                    domain: 'AUTH',
                    action: 'LOGIN_SUCCESS',
                    result: 'SUCCESS',
                    userId: existingUser?._id.toString() || 'unknown',
                    targetType: 'auth',
                    metadata: { email: user.email, provider: account?.provider }
                });
                return true;
            } catch (error: any) {
                console.error("Social Signin Error:", error);
                logAudit({
                    domain: 'AUTH',
                    action: 'AUTH_SYSTEM_ERROR',
                    result: 'FAIL',
                    errorCategory: 'UNKNOWN',
                    errorMessage: error.message
                });
                return false;
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role || 'student';
                token.id = user.id;
                token.isBlocked = user.isBlocked;
                token.picture = user.image;
            }

            // Refetch strict authority on every JWT access (poll for ban/role change)
            if (token.sub) {
                await dbConnect();
                // Check against DB
                const freshUser = await User.findById(token.sub).select('role isBlocked isVerified image');
                if (freshUser) {
                    token.role = freshUser.role;
                    token.isBlocked = freshUser.isBlocked; // Add to token
                    token.isVerified = freshUser.isVerified;
                    token.picture = freshUser.image;
                }
            }

            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.isVerified = token.isVerified as boolean;
                // @ts-ignore
                session.user.isBlocked = token.isBlocked as boolean;
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
