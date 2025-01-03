import ClientModel from '../../model/usermodel/clientModel.js'
import AdminModel from '../../model/usermodel/adminModel.js'
import { SentMail } from "../../components/middlewares/SentMail.js"
import bcrypt from 'bcrypt'

const mailer = new SentMail();

class ClientPasswordManagement {
    constructor() {
        this.otp = null;
        this.clientDetails = null;
    }

    // there is a bug here (undefined username)
    verifyClient = async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Invalid email! - backend" });
        try {
            const isValidClient = await ClientModel.findOne({ email }).select("+password");
            if (!isValidClient) return res.status(404).json({ message: "Account not found! - backend" });
            this.clientDetails = isValidClient; // this contains the password as well

            if (email !== isValidClient.email) return res.status(403).json({ message: "Incorrect email! Authorization denied! - backend" });

            const title = (isValidClient.gender === 'male') ? 'Mr' : 'Ms';

            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            this.otp = generatedOTP;

            const mailBody = {
                to: isValidClient.email,
                subject: "Changing password",
                text: `Hi ${title}. ${isValidClient.name}, your OTP for changing password is ${generatedOTP}. Use the OTP to change your password one time. Thanks, Coffee Team.`
            }

            mailer.setUp();
            await mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text); // 'await' is optional here

            return res.status(200).json({ message: `OTP is sent successfully to "${isValidClient.email}"` });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change your password! - backend" });
        }
    }

    verifyOTP = async (req, res) => {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: "Invalid otp! - backend" });
        try {
            if (otp !== this.otp) return res.status(409).json({ message: "Incorrect OTP! - backend" });

            return res.status(200).json({ message: "OTP verification successfull! - backend" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to verify the OTP! - backend" });
        }
    }

    changePassword = async (req, res) => {
        const { newPassword } = req.body; // current password and new password (as an object)
        if (!newPassword) return res.status(400).json({ message: "Invalid password!- backend" });
        try {
            const duplicatePassword = await bcrypt.compare(newPassword, this.clientDetails.password); // check if the new password is same as the old password
            if (duplicatePassword) return res.status(409).json({ message: "You cannot set the old password as the new password! Please try other passwords! - backend" });

            // if the new password !== the old password, update the old password with the new hashed password
            if (!duplicatePassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                this.clientDetails.password = hashedPassword;
                await this.clientDetails.save();
            }

            return res.status(201).json({ message: "New password updated! - backend" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change the password - backend!" });
        }
    }
}

const clientPasswordManagement = new ClientPasswordManagement();

export const verifyClient = clientPasswordManagement.verifyClient.bind(clientPasswordManagement);
export const verifyOTPClient = clientPasswordManagement.verifyOTP.bind(clientPasswordManagement);
export const changePasswordClient = clientPasswordManagement.changePassword.bind(clientPasswordManagement);


class AdminPasswordManagement {
    constructor() {
        this.otp = null;
        this.adminDetails = null;
    }

    verifyClient = async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Invalid email! - backend" });
        try {
            const isValidAdmin = await AdminModel.findOne({ email }).select("+password");
            if (!isValidAdmin) return res.status(404).json({ message: "Account not found! - backend" });
            this.adminDetails = isValidAdmin; // this contains the password as well

            if (email !== isValidAdmin.email) return res.status(403).json({ message: "Incorrect email! Authorization denied! - backend" });

            const title = (isValidAdmin.gender === 'male') ? 'Mr' : 'Ms';

            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            this.otp = generatedOTP;

            const mailBody = {
                to: isValidAdmin.email,
                subject: "Changing password",
                text: `Hi ${title}. ${isValidAdmin.name}, your OTP for changing password is ${generatedOTP}. Use the OTP to change your password one time. Thanks, Coffee Team.`
            }

            mailer.setUp();
            await mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text); // 'await' is optional here

            return res.status(200).json({ message: `OTP is sent successfully to "${isValidAdmin.email}"` });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change your password! - backend" });
        }
    }

    verifyOTP = async (req, res) => {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: "Invalid otp! - backend" });
        try {
            if (otp !== this.otp) return res.status(409).json({ message: "Incorrect OTP! - backend" });

            return res.status(200).json({ message: "OTP verification successfull! - backend" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to verify the OTP! - backend" });
        }
    }

    changePassword = async (req, res) => {
        const { newPassword } = req.body; // current password and new password (as an object)
        if (!newPassword) return res.status(400).json({ message: "Invalid password!- backend" });
        try {
            const duplicatePassword = await bcrypt.compare(newPassword, this.adminDetails.password); // check if the new password is same as the old password
            if (duplicatePassword) return res.status(409).json({ message: "You cannot set the old password as the new password! Please try other passwords! - backend" });

            // if the new password !== the old password, update the old password with the new hashed password
            if (!duplicatePassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                this.adminDetails.password = hashedPassword;
                await this.adminDetails.save();
            }

            return res.status(201).json({ message: "New password updated! - backend" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change the password - backend!" });
        }
    }
}

const adminPasswordManagement = new AdminPasswordManagement();

export const verifyAdmin = adminPasswordManagement.verifyClient.bind(adminPasswordManagement);
export const verifyOTPAdmin = adminPasswordManagement.verifyOTP.bind(adminPasswordManagement);
export const changePasswordAdmin = adminPasswordManagement.changePassword.bind(adminPasswordManagement);
