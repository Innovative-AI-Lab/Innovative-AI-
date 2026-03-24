import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    expires: "1d",
    default: Date.now,
  },
});

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);
