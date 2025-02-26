import AdminModel from '../../../model/usermodel/adminModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SentMail } from '../../../components/middlewares/SentMail.js';
import mongoose from 'mongoose';

class GenerateToken {
    async generatePrimaryToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '15m' });
    }

    async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.REFRESH_JWT_SECRET);
    }
}

class PrimaryActions {
    async signIn(req, res) {
        const { adminDetails } = req.body;
        if (!adminDetails || typeof adminDetails !== 'object') return res.status(400).json({ message: "User details not provided! - backend" });
        if (!adminDetails.email && !adminDetails.phoneNo) return res.status(400).json({ message: "email or username is required! - backend" });
        // password field should be set to 'required' in frontend
        try {
            // check either email or username
            const isValidAdmin = await AdminModel.findOne({
                $or: [
                    { email: adminDetails.email },
                    { phoneNo: adminDetails.phoneNo }
                ]
            }).select("+password");
            if (!isValidAdmin) {
                if (adminDetails.phoneNo) {
                    return res.status(404).json({ message: `The account with phone number, ${adminDetails.phoneNo} does not exist!` });
                } else {
                    return res.status(404).json({ message: `The account with an email, ${adminDetails.email} does not exist!` });
                }
            }

            const isValidPassword = await bcrypt.compare(adminDetails.password, isValidAdmin.password);
            if (!isValidPassword) return res.status(403).json({ message: "Incorrect password! Authorization denied! - backend" });

            const token = await generateToken.generatePrimaryToken({ adminId: isValidAdmin._id });
            const refreshToken = await generateToken.generateRefreshToken({ adminId: isValidAdmin._id });

            return res.status(200).json({ message: `Login successfull! Welcome to Coffee Restaurant, ${isValidAdmin.title}${isValidAdmin.username}`, token, refreshToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to sign in! - backend" });
        }
    }

    async signUp(req, res) {
        // mail setUp
        const mailer = new SentMail();
        await mailer.setUp();

        const { adminDetails } = req.body;
        if (!adminDetails || typeof adminDetails !== 'object') return res.status(401).json({ message: "Invalid user details! - backend" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate otp
        adminDetails.age = Number(adminDetails.age);

        try {
            const hashedPassword = await bcrypt.hash(adminDetails.password, 10);
            const otpExpiration = Date.now().toLocaleString();
            const createdAccount = await AdminModel.create({ ...adminDetails, password: hashedPassword, otp, otpExpiresAt: otpExpiration });
            if (!createdAccount) return res.status(500).json({ message: "Account cannot be created! - backend" });

            const mailBody = {
                to: `${createdAccount.email}`,
                subject: "OTP verification - Coffee Restaurant",
                text: `Dear ${createdAccount.title}${createdAccount.username}, please use this OTP: ${otp} to finish up the signup process. Thanks Coffee Restaurant.`
            }

            const mail = await mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text);
            if (!mail) {
                await createdAccount.deleteOne(); // Delete the account if mail fails
                return res.status(500).json({ message: "Failed to send OTP. Terminating the sign up process! - backend" });
            }

            // generate token
            const token = await generateToken.generatePrimaryToken({ adminId: createdAccount._id });
            const refreshToken = await generateToken.generateRefreshToken({ adminId: createdAccount._id });

            return res.status(200).json({ message: `An OTP has been sent to ${createdAccount.email}. Please verify the OTP to complete the signup process.`, token, refreshToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to signup for an account! Please try again later - backend" });
        }
    }

    async confirmOTP(req, res) {
        const { otp } = req.body;
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(401).json({ message: "Invalid admin Id! - backend" });
        if (!otp || typeof otp !== 'string') return res.status(401).json({ message: "OTP is invalid! - backend" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(404).json({ message: "Account not found! - backend" });

            if (Date.now() > isValidAdmin.otpExpiresAt) { // if token is expired, delete the created account
                await isValidAdmin.deleteOne();
                return res.status(400).json({ message: "OTP has expired! Please request a new one!" });
            } else if (otp !== isValidAdmin.otp) { // if the request token is not same as the saved otp, delete the created account
                await isValidAdmin.deleteOne();
                return res.status(409).json({ message: "Incorrect otp! - backend" });
            }
            // if the otp is verified, delete the otp from the model
            // Option 1: Set otp to undefined and save
            isValidAdmin.otp = undefined; // following the option 1
            isValidAdmin.otpExpiresAt = undefined; // following the option 1
            await isValidAdmin.save();

            // Option 2: Use $unset to remove the otp field directly
            // await AdminModel.updateOne({ _id: adminId }, { $unset: { otp: 1 } });
            const timestamp = new Date().toLocaleString();

            return res.status(201).json({ message: `Sign up successfully! Welcome to Coffee Restaurant  ${isValidAdmin.title}${isValidAdmin.username}. Signed up at ${timestamp}` });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to verify the OTP!" });
        }
    }

    async logout(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });
        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(403).json({ message: "Invalid admin Id! Authorization revoked! - backend" });

            return res.status(200).json({ message: "Logout successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to logout! - backend" });
        }
    }

}


const generateToken = new GenerateToken();
const primaryActions = new PrimaryActions();

export default primaryActions;
