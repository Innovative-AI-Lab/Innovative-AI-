import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import { blacklistToken } from "../middleware/auth.middleware.js";


export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { displayName, email, password } = req.body;
        const user = await userService.createUser({ displayName, email, password });

        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(201).json({user, token});
    }catch(error){
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        res.status(400).json({ error: error.message });
    }
}

export const loginUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(200).json({ user, token });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const profileController = async (req, res) => {
    const user = await userModel.findById(req.user._id).select('-password');
    res.status(200).json({ user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        if (token) {
            await blacklistToken(token);
        }
        
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}


export const updateProfileController = async (req, res) => {
    try {
        const userId = req.user._id;
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        const userObj = updatedUser.toObject();
        delete userObj.password;
        res.status(200).json({ user: userObj, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(400).json({ message: error.message });
    }
};

export const updatePasswordController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }
        if (newPassword.length < 3) {
            return res.status(400).json({ message: 'New password must be at least 3 characters.' });
        }

        await userService.updateUserPassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllUsersController = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {

        console.log(err)

        res.status(400).json({ error: err.message })

    }
}
