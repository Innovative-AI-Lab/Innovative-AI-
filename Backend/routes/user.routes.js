import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// REGISTER
router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  userController.createUserController
);

// LOGIN
router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  userController.loginUserController
);

// PROFILE
router.get("/profile", authMiddleware.authUser, userController.profileController);

// LOGOUT
router.get("/logout", authMiddleware.authUser, userController.logoutController);

// UPDATE PROFILE
router.put("/profile", authMiddleware.authUser, userController.updateProfileController);

// UPDATE PASSWORD
router.put("/password", authMiddleware.authUser, userController.updatePasswordController);

// GET ALL USERS
router.get("/all", authMiddleware.authUser, userController.getAllUsersController);

// ADMIN CREATE USER
router.post("/create", authMiddleware.authUser, userController.createUserByAdminController);

// ADMIN UPDATE USER
router.put("/:id", authMiddleware.authUser, userController.updateUserByAdminController);

// DELETE USER
router.delete("/:id", authMiddleware.authUser, userController.deleteUserController);

export default router;