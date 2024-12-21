import mongoose from 'mongoose';
import AdminModel from '../../../model/usermodel/adminModel.js'
import bcrypt from 'bcrypt'

class DeleteAdmin {
    async delete(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id - backend" });
        const { password } = req.body; // deleting the account requires addition security (needs password for authorization)
        if (!password) return res.status(400).json({ message: "New password is required! - baceknd" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("+password");
            if (!isValidAdmin) return res.status(403).json({ message: "Invalid admin(Authentication failed)! Authorization revoked! - backend" });

            const isValidPassword = await bcrypt.compare(password, isValidAdmin.password);
            if (!isValidPassword) {
                return res.status(409).json({ message: "Incorrect password! Account deletion process terminated! - backend" })
            } else {
                await isValidAdmin.deleteOne(); // delete the account if the password is correct
            }

            return res.status(200).json({ message: "Account deleted successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to delete your account! - backend" });
        }
    }
}

class UpdateAdmin {
    async update(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id - backend" });
        const { updateDetails } = req.body;
        if (!updateDetails || typeof updateDetails !== 'object') return res.status(400).json({ message: "New details is required! - backend" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(403).json({ message: "Invalid admin(Authentication failed)! Authorization denied! - backend" });

            if (JSON.stringify(updateDetails) === JSON.stringify(isValidAdmin.toObject())) {
                return res.status(409).json({ message: "The old details and the new details are same! - backend" })
            } else {
                Object.assign(isValidAdmin, updateDetails);
                await isValidAdmin.save();
            }

            return res.status(200).json({ message: "Account updated successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to update your account! - backend" });
        }
    }
}


const deleteAdmin = new DeleteAdmin();
const updateAdmin = new UpdateAdmin();

export default {
    deleteAdmin: deleteAdmin.delete,
    updateAdmin: updateAdmin.update
}
