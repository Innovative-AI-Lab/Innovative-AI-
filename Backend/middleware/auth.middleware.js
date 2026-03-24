import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistedToken.model.js";
import userModel from "../models/user.model.js";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized User' });
        }

        const blacklistedToken = await BlacklistedToken.findOne({ token });

        if (blacklistedToken) {
            res.clearCookie('token');
            return res.status(401).json({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email }).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized User' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized User' });
    }
}

export const blacklistToken = async (token) => {
    const newBlacklistedToken = new BlacklistedToken({ token });
    await newBlacklistedToken.save();
}