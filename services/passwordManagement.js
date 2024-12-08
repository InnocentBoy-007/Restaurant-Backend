// send OTP to the registered email first
// verify the OTP
// enter a new password

import mongoose from "mongoose";
import ClientModel from '../model/usermodel/clientModel.js'
import { SentMail } from "../components/middlewares/SentMail.js";

class ClientPasswordManagement {
    constructor() {
        this.otp = null;
        this.mailer = new SentMail();
        this.clientId = null;
    }

    validateClientId(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(401).json({ message: "Invalid clientId! Authorization denied! - backend" });
        }
        this.clientId = clientId;

        return true; // return 'true' if the validation is correct
    }

    verifyClient = async (req, res) => {
        if (!this.validateClientId(req, res)) return;

        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Invalid email! - backend" });
        try {
            const isValidClient = await ClientModel.findById(this.clientId).select("+password");
            if (!isValidClient) return res.status(404).json({ message: "Account not found! - backend" });

            if (email !== isValidClient.email) return res.status(409).json({ message: "Incorrect email! Authorization denied! - backend" });

            const title = (isValidClient.gender === 'male') ? 'Mr' : 'Ms';

            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            this.otp = generatedOTP;

            const mailBody = {
                to: isValidClient.email,
                subject: "Changing password",
                text: `Hi! ${title}. ${isValidClient.name}, your OTP for changing password is ${generatedOTP}. Thanks, Coffee Team.`
            }

            this.mailer.setUp();
            await this.mailer.sentMail(mailBody.to, mailBody.subject, mailBody.text); // 'await' is optional here

            return res.status(200).json({ message: "OTP sent successfully!" });
        } catch (error) {
            console.error(error);

            return res.status(500).json({ message: "An unexpected error occured while trying to change your password! - backend" });
        }
    }

    verifyOTP = async (req, res) => {
        if (!this.validateClientId(req, res)) return;

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
}
