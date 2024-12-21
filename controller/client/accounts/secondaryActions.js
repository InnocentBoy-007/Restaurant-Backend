import mongoose from 'mongoose';
import ClientModel from '../../../model/usermodel/clientModel.js'
import bcrypt from 'bcrypt'

class DeleteClient {
    async delete(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid client id! - backend" });
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "New password is required! - backend" });

        try {
            const isValidClient = await ClientModel.findById(clientId).select("+password");
            if (!isValidClient) return res.status(404).json({ message: "Account cannot be deleted since it does not exist! - backend" });

            const isValidPassword = await bcrypt.compare(password, isValidClient.password);
            if (!isValidPassword) {
                return res.status(409).json({ message: "Incorrect password! Authorization revoked! - backend" });
            } else {
                await isValidClient.deleteOne();
            }

            return res.status(200).json({ message: "Your account is deleted successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to delete your account! - backend" });
        }
    }
}

class UpdateClient {
    async update(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid client id! - backend" });
        const { updateDetails } = req.body;
        if (!updateDetails || typeof updateDetails) return res.status(400).json({ message: "new details is required! - backend" });
        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(403).json({ message: "Invalid admin(Authentication failed)! Authorization denied! - backend" });

            if (JSON.stringify(updateDetails) === JSON.stringify(isValidClient.toObject())) {
                return res.status(409).json({ message: "The old details and the new details are same! - backend" });
            } else {
                Object.assign(isValidClient, updateDetails);
                await isValidClient.save();
            }

            return res.status(200).json({ message: "Account updated succesfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to update your account! - backend" });
        }
    }

}

const deleteClient = new DeleteClient();
const updateClient = new UpdateClient();

export default {
    deleteClient: deleteClient.delete,
    updateClient: updateClient.update
}
