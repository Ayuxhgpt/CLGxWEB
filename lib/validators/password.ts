
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/\d/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }
    // Add more complexity checks here if needed (e.g., uppercase, special char)
    return { isValid: true };
};
