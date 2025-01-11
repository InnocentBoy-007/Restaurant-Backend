import ClientModel from '../../model/usermodel/clientModel.js'
import AdminModel from '../../model/usermodel/adminModel.js'

import bcrypt from 'bcrypt'
import mongoose from 'mongoose';

class ChangePassword {
    async AdminChangePassword(req, res) {
        const adminId = req.adminId;
        if(!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({message:"Invalid adminId! - backend"});

        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "The request body is invalid! Invalid password - backend!" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("+password");
            if (!isValidAdmin) return res.status(404).json({ message: "Account not found! - backend" });

            const hasPasswordConflict = await bcrypt.compare(password, isValidAdmin.password);
            if (hasPasswordConflict) return res.status(409).json({ message: "The new password cannot be the old password! - backend" });

            // if there ins't anything wrong with the new password, then hashed the password and then save it
            const hashedPassword = await bcrypt.hash(password, 10);
            isValidAdmin.password = hashedPassword;
            await isValidAdmin.save();

            return res.status(201).json({ message: "Password changed successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to update/change your current password! - backend" });
        }
    }

    async ClientChangePassword(req, res) {
        const clientId = req.clientId;
        if(!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({message:"Invalid clientId! - backend"});

        const { passwords } = req.body;
        if (!passwords || typeof passwords !== 'object') return res.status(400).json({ message: "The request body is either invalid or is not an object - backend!" });
        if (!passwords.currentPassword || !passwords.newPassword) return res.status(400).json({ message: "Invalid password! - backend" });

        try {
            const isValidClient = await ClientModel.findById(clientId).select("+password");
            if (!isValidClient) return res.status(404).json({ message: "Account not found! - backend" });

            const isValidCurrentPassword = await bcrypt.compare(passwords.currentPassword, isValidClient.password);
            if (isValidCurrentPassword) {
                // if the current password is correct
                const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
                // updates the new password into the database
                isValidClient.password = hashedPassword;
                await isValidClient.save();
            }

            return res.status(201).json({ message: "Password changed successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to update/change your current password! - backend" });
        }
    }
}


const changePassword = new ChangePassword();
export default changePassword;
