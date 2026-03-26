import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // important for security
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [250, "Bio max 250 chars"],
    },
    photoURL: {
      type: String,
      trim: true,
    },
    settings: {
      theme: {
        type: String,
        default: "light",
      },
      fontSize: {
        type: Number,
        default: 14,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
      aiAssistance: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// ================= HASH PASSWORD =================
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

// ================= PASSWORD CHECK =================
userSchema.methods.isValidPassword = async function (password) {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    return false;
  }
};

// ================= JWT =================
userSchema.methods.generateJWT = function () {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in .env");
    }

    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

export default User;