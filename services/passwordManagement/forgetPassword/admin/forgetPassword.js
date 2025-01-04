import AdminModel from '../../../../model/usermodel/adminModel.js'
import { SentMail } from '../../../../components/middlewares/SentMail.js';
import bcrypt from 'bcrypt'
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'

class GenerateToken {
    async generatePrimaryToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '1h' });
    }

    async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { 'expiresIn': '1h' });
    }
}

class AdminPasswordManagement {
    verifyAdmin = async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Invalid email! - backend" });

        try {
            const isValidAdmin = await AdminModel.findOne({ email }).select("+password");
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid email! Account not found! - backend" });

            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            isValidAdmin.otp = generatedOTP;
            await isValidAdmin.save();

            const mailBody = {
                to: isValidAdmin.email,
                subject: "Changing password",
                text: `Hi ${title}. ${isValidAdmin.username}, your OTP for changing password is ${generatedOTP}. Use the OTP to change your password one time. Thanks, Coffee Team.`
            }

            mailer.setUp();
            await mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text); // 'await' is optional here

            const token = await generateToken.generatePrimaryToken({ adminId: isValidAdmin._id });
            const refreshToken = await generateToken.generateRefreshToken({ adminId: isValidAdmin._id });

            return res.status(200).json({ message: `OTP is sent successfully to "${isValidAdmin.email}"`, token, refreshToken });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change your password! - backend" });
        }
    }

    verifyOTP = async (req, res) => {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });

        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: "Invalid otp! - backend" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("otp");
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid admin Id! User not found! - backend" });

            // delete the otp disregard of true or false
            delete isValidAdmin.otp;
            await isValidAdmin.save();

            if (otp !== isValidAdmin.otp) return res.status(409).json({ message: "Incorrect OTP! - backend" });

            return res.status(200).json({ message: "OTP verification successfull! - backend" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to verify the OTP! - backend" });
        }
    }

    changePassword = async (req, res) => {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });

        const { newPassword } = req.body; // current password and new password (as an object)
        if (!newPassword) return res.status(400).json({ message: "Invalid password!- backend" });

        try {
            const isValidAdmin = await AdminModel.findById(clientId).select("+password");
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid admin Id! User not found! - backend" });

            const duplicatePassword = await bcrypt.compare(newPassword, isValidAdmin.password); // check if the new password is same as the old password
            if (duplicatePassword) {
                return res.status(409).json({ message: "You cannot set the old password as the new password! Please try other passwords! - backend" });
            } else {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                isValidAdmin.password = hashedPassword;
                isValidAdmin.save();
            }

            return res.status(201).json({ message: "New password updated! - backend" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change the password - backend!" });
        }
    }
}

const mailer = new SentMail();
const generateToken = new GenerateToken();
const adminPasswordManagement = new AdminPasswordManagement();
export default adminPasswordManagement;
