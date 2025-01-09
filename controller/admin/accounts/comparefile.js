import mongoose from "mongoose";
import AdminModel from "../../../model/usermodel/adminModel.js";
import bcrypt from "bcrypt";
import { SentMail } from "../../../components/middlewares/SentMail.js";

class SecondaryActions {
    async DeleteAdmin(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id - backend" });
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "Password is required! - backend" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("+password");
            if (!isValidAdmin) return res.status(403).json({ message: "Invalid admin (Authentication failed)! Authorization revoked! - backend" });

            const isValidPassword = await bcrypt.compare(password, isValidAdmin.password);
            if (!isValidPassword) {
                return res.status(409).json({ message: "Incorrect password! Account deletion process terminated! - backend" });
            } else {
                await isValidAdmin.deleteOne();
            }

            return res.status(200).json({ message: "Account deleted successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to delete your account! - backend" });
        }
    }

    async UpdateAdmin(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: "Invalid admin Id - backend" });
        }

        const { updateDetails } = req.body;
        if (!updateDetails || typeof updateDetails !== "object") return res.status(400).json({ message: "New details are required! - backend" });

        await mailer.setUp();

        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("+password");
            if (!isValidAdmin) return res.status(403).json({ message: "Invalid admin (Authentication failed)! Authorization denied! - backend" });

            let isSame = true;
            let emailChanged = false;
            for (const key in updateDetails) {
                if (updateDetails[key] !== isValidAdmin[key]) {
                    isSame = false;
                    if (key === "email") {
                        emailChanged = true;
                    }
                }
            }

            if (isSame) {
                return res.status(409).json({ message: "The old details and the new details are the same! - backend" });
            }

            if (emailChanged) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const mailBody = {
                    to: updateDetails.email,
                    subject: "Email Change Verification",
                    text: `Hi, ${isValidAdmin.title} ${isValidAdmin.username}, you've changed your email! Please verify using this OTP: ${otp}.`,
                };
                isValidAdmin.otp = await bcrypt.hash(otp, 10);
                isValidAdmin.otpExpiresAt = Date.now() + 10 * 60 * 1000;
                await isValidAdmin.save();
                await mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text);

                return res.status(200).json({ message: "OTP sent to the new email. Please verify to complete the update." });
            }

            Object.assign(isValidAdmin, updateDetails);
            isValidAdmin.updatedAtLocaleTime = new Date().toLocaleString();
            await isValidAdmin.save();

            return res.status(200).json({ message: "Account updated successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to update your account! - backend" });
        }
    }

    async confirmOTP(req, res) {
        const adminId = req.adminId;
        const { otp } = req.body;

        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID!" });
        }
        if (!otp) {
            return res.status(400).json({ message: "OTP is required!" });
        }

        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) {
                return res.status(403).json({ message: "Invalid admin! Authentication failed." });
            }

            if (Date.now() > isValidAdmin.otpExpiresAt) {
                return res.status(400).json({ message: "OTP has expired! Please request a new one." });
            }

            const isOtpValid = await bcrypt.compare(otp, isValidAdmin.otp);
            if (!isOtpValid) {
                return res.status(400).json({ message: "Incorrect OTP!" });
            }

            isValidAdmin.otp = undefined;
            isValidAdmin.otpExpiresAt = undefined;
            await isValidAdmin.save();

            return res.status(200).json({ message: "OTP confirmed successfully!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while confirming the OTP!" });
        }
    }
}

const mailer = new SentMail();
const secondaryActions = new SecondaryActions();
export default secondaryActions;
