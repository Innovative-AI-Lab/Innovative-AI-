import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: [3, 'Email should be at least 6 characters long'],
        maxLength: [50, 'Email should be at most 50 characters long']
    },
    password:{
        type: String,
        select : false,
    }
})


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