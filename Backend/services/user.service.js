import User from "../models/user.model.js";

// ================= CREATE USER =================
export const createUser = async ({ displayName, email, password }) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // 🔥 check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const user = await User.create({
      displayName: displayName || email.split("@")[0],
      email,
      password,
    });

    return user;

  } catch (err) {
    console.error("CREATE USER ERROR:", err.message);
    throw err;
  }
};

// ================= UPDATE PROFILE =================
export const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const { displayName, bio, photoURL, settings } = updateData;

    if (displayName !== undefined) user.displayName = String(displayName).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (photoURL !== undefined) user.photoURL = String(photoURL).trim();

    if (settings && typeof settings === "object") {
      user.settings.theme = settings.theme ?? user.settings.theme;
      user.settings.fontSize =
        settings.fontSize !== undefined ? Number(settings.fontSize) : user.settings.fontSize;
      user.settings.autoSave =
        settings.autoSave !== undefined ? Boolean(settings.autoSave) : user.settings.autoSave;
      user.settings.aiAssistance =
        settings.aiAssistance !== undefined ? Boolean(settings.aiAssistance) : user.settings.aiAssistance;

      user.markModified("settings");
    }

    await user.save();

    return await User.findById(userId).select("-password");

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err.message);
    throw err;
  }
};

// ================= UPDATE PASSWORD =================
export const updateUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");

    if (!user) throw new Error("User not found");

    const isMatch = await user.isValidPassword(currentPassword);

    if (!isMatch) throw new Error("Invalid current password");

    user.password = newPassword;

    await user.save();

  } catch (err) {
    console.error("UPDATE PASSWORD ERROR:", err.message);
    throw err;
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async ({ userId }) => {
  try {
    return await User.find({ _id: { $ne: userId } }).select("-password");
  } catch (err) {
    console.error("GET USERS ERROR:", err.message);
    throw err;
  }
};

// ================= DELETE USER =================
export const deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    await User.findByIdAndDelete(userId);

    return true;

  } catch (err) {
    console.error("DELETE USER ERROR:", err.message);
    throw err;
  }
};