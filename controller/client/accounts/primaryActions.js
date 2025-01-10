import ClientModel from '../../../model/usermodel/clientModel.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import { SentMail } from '../../../components/middlewares/SentMail.js';
import bcrypt from 'bcrypt'

class GenerateToken {
    async generatePrimaryToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '1h' });
    }

    async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.REFRESH_JWT_SECRET);
    }
}

class ClientSignIn {
    async signIn(req, res) {
        const { clientDetails } = req.body;

        if (!clientDetails || typeof clientDetails !== 'object') return res.status(400).json({ message: "User details not provided! - backend" });
        if (!clientDetails.email && !clientDetails.phoneNo) return res.status(400).json({ message: "email or username is required! - backend" });

        try {
            const isValidClient = await ClientModel.findOne({
                $or: [
                    { email: clientDetails.email },
                    { phoneNo: clientDetails.phoneNo }
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

            const token = await generateToken.generatePrimaryToken({ clientId: isValidClient._id });
            const refreshToken = await generateToken.generateRefreshToken({ clientId: isValidClient._id });

            return res.status(200).json({ message: `Login successfull! Welcome to Coffee Restaurant, ${title}${isValidClient.username}`, token, refreshToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to sign in! - backend" });
        }
    }
}

class ClientSignUp {
    // check if the given email or username is already signed up
    async signUp(req, res) {
        const mailer = new SentMail();
        await mailer.setUp();
        const { clientDetails } = req.body;
        if (!clientDetails || typeof clientDetails !== 'object') return res.status(400).json({ message: "Invalid user details! - backend" });

        try {
            // check if the email or the username is already taken
            const isClientDuplicate = await ClientModel.findOne({
                $or: [
                    { email: clientDetails.email },
                    { username: clientDetails.username }
                ]
            });
            if (isClientDuplicate) {
                if (isClientDuplicate.email === clientDetails.email) return res.status(400).json({ message: 'Email already exists.' });
                if (isClientDuplicate.username === clientDetails.username) return res.status(400).json({ message: 'Username already exists.' });
            }

            const hashedPassword = await bcrypt.hash(clientDetails.password, 10);
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate otp
            const createdAccount = await ClientModel.create({ ...clientDetails, password: hashedPassword, otp });
            if (!createdAccount) return res.status(500).json({ message: "Account cannot be created! - backend" });

            const mailBody = {
                to: `${createdAccount.email}`,
                subject: "OTP verification - Coffee Restaurant",
                text: `Dear ${createdAccount.title}. ${createdAccount.username}, please use this OTP: ${otp} to finish up the signup process. Thanks Coffee Restaurant.`
            }

            const mail = await mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text);
            if (!mail) {
                await createdAccount.deleteOne(); // Delete the account if mail fails
                return res.status(500).json({ message: "Failed to send OTP. Terminating the sign up process! - backend" });
            }

            return res.status(200).json({ message: `An OTP has been sent to ${createdAccount.email}. Please verify the OTP to complete the signup process.`, clientId: createdAccount._id });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to signup for an account! Please try again later - backend" });
        }
    }

    async confirmOTP(req, res) {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: "OTP is invalid! - backend" });

        try {
            const isValidClient = await ClientModel.findOne({ otp });

            // delete the otp property if the otp is confirmed else delete the associated account and return an error
            if (isValidClient) {
                await isValidClient.updateOne({ $unset: { otp: "" } });
            } else {
                await ClientModel.deleteOne({ _id: clientId });
                return res.status(404).json({ message: "Incorrect otp! - backend" })
            }

            isValidClient.signUpAt = new Date().toLocaleString();
            await isValidClient.save();

            const token = await generateToken.generatePrimaryToken({ clientId: isValidClient._id });
            const refreshToken = await generateToken.generateRefreshToken({ clientId: isValidClient._id });

            return res.status(201).json({ message: `Sign up successfully! Welcome to Coffee Restaurant ${isValidClient.title}. ${isValidClient.username}.`, token, refreshToken })
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
