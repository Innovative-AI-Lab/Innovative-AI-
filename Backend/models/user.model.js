import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
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
      select: false,
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [250, 'Bio should be at most 250 characters long'],
    },
    photoURL: {
      type: String,
      trim: true,
    },
    settings: {
      theme: {
        type: String,
        default: 'light',
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


userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function(){
    
    return jwt.sign({email: this.email}, process.env.JWT_SECRET,{ expiresIn: '24h' });
}



const User = mongoose.model('User', userSchema);


export default User;