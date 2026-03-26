import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import * as activityService from "../services/activity.service.js";
import { validationResult } from "express-validator";
import { blacklistToken } from "../middleware/auth.middleware.js";
import { successResponse, errorResponse } from "../utils/response.util.js";
import bcrypt from "bcrypt";

// ================= REGISTER =================
export const createUserController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const user = await userService.createUser({ displayName, email, password });

    const token = user.generateJWT();

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, { user: userObj, token }, "User created successfully", 201);

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return errorResponse(res, "Email already registered", 409);
    }

    return errorResponse(res, error.message || "Registration failed", 400, error);
  }
};

// ================= LOGIN =================
export const loginUserController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    if (!user.password) {
      console.error("Password not found for user:", user._id);
      return errorResponse(res, "Invalid credentials", 401);
    }

    let isMatch = false;
    try {
      if (user.isValidPassword) {
        isMatch = await user.isValidPassword(password);
      } else {
        isMatch = await bcrypt.compare(password, user.password);
      }
    } catch (bcryptError) {
      console.error("Password comparison error:", bcryptError);
      return errorResponse(res, "Invalid credentials", 401);
    }

    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = user.generateJWT();

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, { user: userObj, token }, "Logged in successfully");

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return errorResponse(res, "Internal server error", 500, err);
  }
};

// ================= PROFILE =================
export const profileController = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const user = await userModel.findById(req.user._id).select("-password");

    return successResponse(res, { user }, "Profile fetched successfully");

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ================= LOGOUT =================
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await blacklistToken(token);
    }

    // optional (safe)
    if (req.user?._id) {
      await activityService.logActivity(req.user._id, "logout", "User logged out");
    }

    res.clearCookie("token");

    return successResponse(res, null, "Logged out successfully");

  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return errorResponse(res, "Logout failed", 400);
  }
};

// ================= UPDATE PROFILE =================
export const updateProfileController = async (req, res) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);

    const updatedUser = await userService.updateUserProfile(req.user._id, req.body);

    const userObj = updatedUser.toObject();
    delete userObj.password;

    return successResponse(res, { user: userObj }, "Profile updated");

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return errorResponse(res, error.message, 400);
  }
};

// ================= UPDATE PASSWORD =================
export const updatePasswordController = async (req, res) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "All fields required", 400);
    }

    await userService.updateUserPassword(req.user._id, currentPassword, newPassword);

    return successResponse(res, null, "Password updated");

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ================= GET ALL USERS =================
export const getAllUsersController = async (req, res) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);

    const allUsers = await userService.getAllUsers({ userId: req.user._id });

    return successResponse(res, { users: allUsers }, "Users fetched");

  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return errorResponse(res, err.message, 400);
  }
};

// ================= ADMIN CREATE =================
export const createUserByAdminController = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    const user = await userService.createUser({ displayName, email, password });

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, { user: userObj }, "User created", 201);

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ================= ADMIN UPDATE =================
export const updateUserByAdminController = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.params.id, req.body);

    const userObj = updatedUser.toObject();
    delete userObj.password;

    return successResponse(res, { user: userObj }, "User updated");

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ================= DELETE =================
export const deleteUserController = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return successResponse(res, null, "User deleted");

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};