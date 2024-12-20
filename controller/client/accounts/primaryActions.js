import ClientModel from '../../../model/usermodel/clientModel.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import { SentMail } from '../../../components/middlewares/SentMail.js';
import bcrypt from 'bcrypt'

class GenerateToken {
    async generatePrimaryToken(payload) {
        jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '1h' });
    }

    async generateRefreshToken(payload) {
        jwt.sign(payload, process.env.REFRESH_JWT_SECRET);
    }
}

class ClientSignIn {
    async signIn(req, res) {
        const { clientDetails } = req.body;
        if (!clientDetails || typeof clientDetails !== 'object') return res.status(400).json({ message: "User details not provided! - backend" });
        if (!clientDetails.email && !clientDetails.username) return res.status(400).json({ message: "email or username is required! - backend" });

        try {
            const isValidClient = ClientModel.findOne({
                $or: [
                    { email: clientDetails.email },
                    { username: clientDetails.username }
                ]
            }).select("+password");
            if (!isValidClient) return res.status(404).json({ message: `The account with ${clientDetails.email || clientDetails.username} does not exist!` });
            const title = (isValidClient.gender === 'male') ? 'Mr. ' : 'Ms. ';
            /**
             * Or use a different method which has a gender-neutral title
             * const title = (client.gender === 'male') ? 'Mr. ' :
              (client.gender === 'female') ? 'Ms. ' :
              'Mx. '; // Mx. is a gender-neutral title
             */

            const isValidPassword = await bcrypt.compare(clientDetails.password, isValidClient.password);
            if (!isValidPassword) return res.status(403).json({ message: "Incorrect password! Authorization denied! - backend" });

            const token = generateToken.generatePrimaryToken({ adminId: isValidClient._id });
            const refreshToken = generateToken.generateRefreshToken({ adminId: isValidClient._id });

            return res.status(200).json({ message: `Login successfull! Welcome to Coffee Restaurant, ${title}${isValidClient.username}`, token, refreshToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to sign in! - backend" });
        }
    }
}

class ClientSignUp {
    constructor() {
        this.mailer = new SentMail();
        this.mailer.setUp();
        this.generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate otp
    }

    async signUp(req, res) {
        const clientDetails = req.body;
        if (!clientDetails || typeof clientDetails !== 'object') return res.status(400).json({ message: "Invalid user details! - backend" });
        try {
            const hashedPassword = await bcrypt.hash(adminDetails.password, 10);
            const createdAccount = await ClientModel.create({ ...clientDetails, password: hashedPassword });
            if (!createdAccount) return res.status(500).json({ message: "Account cannot be created! - backend" });

            const mailBody = {
                to: `${createdAccount.email}`,
                subject: "OTP verification - Coffee Restaurant",
                text: `Dear ${createdAccount.title}. ${createdAccount.username}, please use this OTP: ${this.generateOTP()} to finish up the signup process. Thanks Coffee Restaurant.`
            }

            const mail = await this.mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text);
            if (!mail) {
                await createdAccount.deleteOne(); // Delete the account if mail fails
                return res.status(500).json({ message: "Failed to send OTP. Terminating the sign up process! - backend" });
            }

            return res.status(200).json({ message: `An OTP has been sent to ${createdAccount.email}. Please verify the OTP to complete the signup process.` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to signup for an account! Please try again later - backend" });
        }
    }

    async confirmOTP(req, res) {
        const otp = req.body;
        const clientId = req.params;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });
        if (!otp || typeof otp !== 'string') return res.status(400).json({ message: "OTP is invalid! - backend" });
        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(404).json({ message: "Account not found! - backend" });

            if (otp !== isValidClient.otp) {
                await isValidClient.deleteOne();
                return res.status(403).json({ message: "Incorrect otp! - backend" });
            } else {
                // if the otp is verified, delete the otp from the model
                delete isValidClient.otp;
                await isValidClient.save();
            }

            const token = generateToken.generatePrimaryToken({ clientId: isValidClient._id });
            const refreshToken = generateToken.generateRefreshToken({ clientId: isValidClient._id });

            return res.status(201).json({ message: `Sign up successfully! Welcome to Coffee Restaurant  ${isValidClient.title}. ${isValidClient.username}.`, token, refreshToken })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to verify the OTP!" });
        }
    }
}

class ClientLogout {
    async logout(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });
        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(403).json({ message: "Invalid client Id! Authorization revoked! - backend" });

            return res.status(200).json({ message: "Logout successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to logout! - backend" });
        }
    }
}

const generateToken = new GenerateToken();
const clientSignIn = new ClientSignIn();
const clientSignUp = new ClientSignUp();
const clientLogout = new ClientLogout();

export default {
    clientSignIn: clientSignIn.signIn,
    clientSignUp: clientSignUp.signUp,
    clientConfirmOTP: clientSignUp.confirmOTP,
    clientLogout: clientLogout.logout
}
