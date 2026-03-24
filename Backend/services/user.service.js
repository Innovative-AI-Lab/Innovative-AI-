import userModel from '../models/user.model.js';
import User from '../models/user.model.js';


export const createUser = async ({
    displayName,
    email,
    password
}) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        displayName: displayName || email.split('@')[0],
        email,
        password: hashedPassword
    });

    return user;
}

export const updateUserProfile = async (userId, updateData) => {
    const { displayName, bio, photoURL, settings } = updateData;

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (displayName !== undefined) user.displayName = String(displayName).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (photoURL !== undefined) user.photoURL = String(photoURL).trim();
    if (settings && typeof settings === 'object') {
        user.settings.theme        = settings.theme        ?? user.settings.theme;
        user.settings.fontSize     = settings.fontSize !== undefined ? Number(settings.fontSize) : user.settings.fontSize;
        user.settings.autoSave     = settings.autoSave !== undefined ? Boolean(settings.autoSave) : user.settings.autoSave;
        user.settings.aiAssistance = settings.aiAssistance !== undefined ? Boolean(settings.aiAssistance) : user.settings.aiAssistance;
        user.markModified('settings');
    }

    await user.save();
    return await User.findById(userId).select('-password');
};

export const updateUserPassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
        throw new Error('Invalid current password');
    }

    user.password = await User.hashPassword(newPassword);
    await user.save();
};

export const getAllUsers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId }
    });
    return users;
}