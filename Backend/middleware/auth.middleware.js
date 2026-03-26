import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistedToken.model.js";
import userModel from "../models/user.model.js";
import { HttpError } from "../utils/httpError.util.js";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(new HttpError('Unauthorized User', 401));
        }

        const blacklistedToken = await BlacklistedToken.findOne({ token });

        if (blacklistedToken) {
            res.clearCookie('token');
            return next(new HttpError('Unauthorized User', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id).select('-password');
        if (!user) {
            return next(new HttpError('Unauthorized User', 401));
        }
        req.user = user;
        next();
    } catch (error) {
        return next(new HttpError('Unauthorized User', 401, error.message));
    }
}

export const blacklistToken = async (token) => {
    const newBlacklistedToken = new BlacklistedToken({ token });
    await newBlacklistedToken.save();
}