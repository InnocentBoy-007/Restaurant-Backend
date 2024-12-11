import ClientModel from '../../model/usermodel/clientModel.js'
import AdminModel from '../../model/usermodel/adminModel.js'

import bcrypt from 'bcrypt'

class ClientPassword {
    async updateNewPasswordAdmin(req, res) {
        const clientId = req.clientId;

        const { passwords } = req.body;
        if (!passwords || typeof passwords !== 'object') return res.status(400).json({ message: "The request body is either invalid or is not an object - backend!" });
        if (!passwords.newPassword || !passwords.currentPassword) return res.status(400).json({ message: "Invalid password! - backend" });
        try {
            const isValidClient = await ClientModel.findById(clientId).select("+password");
            if (!isValidClient) return res.status(404).json({ message: "Account not found! - backend" });

            const isValidCurrentPassword = await bcrypt.compare(passwords.currentPassword, isValidClient.password);
            if (!isValidCurrentPassword) return res.status(409).json({ message: "Incorrect current password! - backend" });

            // if the current password is correct
            const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
            // updates the new password into the database
            isValidClient.password = hashedPassword;
            await isValidClient.save();

            return res.status(201).json({ message: "Password changed successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to update/change your current password! - backend" });
        }
    }
}

class AdminPassword {
    async updateNewPasswordAdmin(req, res) {
        const adminId = req.adminId;

        const { passwords } = req.body;
        if (!passwords || typeof passwords !== 'object') return res.status(400).json({ message: "The request body is either invalid or is not an object - backend!" });
        if (!passwords.newPassword || !passwords.currentPassword) return res.status(400).json({ message: "Invalid password! - backend" });
        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("+password");
            if (!isValidAdmin) return res.status(404).json({ message: "Account not found! - backend" });

            const isValidCurrentPassword = await bcrypt.compare(passwords.currentPassword, isValidAdmin.password);
            if (!isValidCurrentPassword) return res.status(409).json({ message: "Incorrect current password! - backend" });

            // if the current password is correct
            const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
            // updates the new password into the database
            isValidAdmin.password = hashedPassword;
            await isValidAdmin.save();

            return res.status(201).json({ message: "Password changed successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occurred while trying to update/change your current password! - backend" });
        }
    }
}

const updateNewPasswordClient = new ClientPassword();
const updateNewPasswordAdmin = new AdminPassword();
export const updateClientPassword = updateNewPasswordClient.updateNewPasswordAdmin.bind(updateNewPasswordClient);
export const updateAdminPassword = updateNewPasswordAdmin.updateNewPasswordAdmin.bind(updateNewPasswordAdmin);
