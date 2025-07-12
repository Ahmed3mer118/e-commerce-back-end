const User = require("../models/userModel")
const catchAsync = require("../utils/catch-async.util")
const AppError = require("../utils/app-error.util")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendEmail")

exports.register = (role) => {
    return catchAsync(async (req, res, next) => {
        const { userName, email, password, phone_number, role } = req.body
        if (!["admin", "user"].includes(role)) {
            return next(new AppError("Invalid Role in  Creation", 400))
        }
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({ message: "Email already in used" })
            return next(new AppError("Email already in used", 400))
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({ userName, email, password, phone_number, role, verificationCode });

        await sendEmail({
            to: email,
            subject: "Your Verification Code",
            message: `Your verification code is: ${verificationCode}`
        });


        res.status(201).json({ message: "user created", user })
    }

    )
}

exports.verifyEmail = async (req, res, next) => {
    const { email, code } = req.body
    const user = await User.findOne({ email })
    if (!user || user.verificationCode !== code) {
        return res.status(400).json({ message: "Invalid Code" })
        // return next(new AppError("Invalid verification code", 400));
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
}

const signToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password, phoneNumber } = req.body;
        if ((!email && !phoneNumber) || !password) {
            return res.status(400).json({ error: "Email or phone number and password are required." });
        }
        const user = await User.findOne({ $or: [{ email }, { phone_number: phoneNumber }] });
        if (!user) {
            return res.status(404).json({ error: "Invalid Email or password." });
        }
        const isPasswordVaild = await bcrypt.compare(password, user.password)
        if (!isPasswordVaild) {
            return res.status(401).json({ error: "Invalid Email or password." });
        }

        const token = signToken(user)

        return res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An unexpected error occurred during login." });
    }
}
exports.forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;

    await sendEmail({
        to: user.email,
        subject: "Password Reset Code",
        message: `Use this code to reset your password: ${resetCode}`
    });

    await user.save();
    res.status(200).json({ message: "Reset code sent to email" });
};
exports.resetPassword = async (req, res, next) => {
    try {

        const { email, resetCode, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError("No user found with this email", 404));
        }
        if (!user.resetCode || String(user.resetCode) !== String(resetCode)) {
            return res.status(400).json({ error: "Reset Code Is Invalid" });
          }
        if( Date.now() > user.resetCodeExpires){
            return res.status(400).json({error:"Invalid or expired reset code"});
        }
        user.password = newPassword;
        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        next(err)
    }
};


// exports.getUsers = async (req, res) => {
//     const users = await User.find();
//     res.status(200).json({ message: "list of users", data: users })
// }


