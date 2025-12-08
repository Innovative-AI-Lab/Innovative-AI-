import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

// Simple in-memory blacklist (replace with MongoDB collection if needed)
const tokenBlacklist = new Set();

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).send({ error: "Unauthorized User"});
        }

        if (tokenBlacklist.has(token)) {
            res.clearCookie("token");
            return res.status(401).send({ error: "Unauthorized User"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: "Unauthorized User" });
    }
}

export const blacklistToken = (token) => {
    tokenBlacklist.add(token);
}