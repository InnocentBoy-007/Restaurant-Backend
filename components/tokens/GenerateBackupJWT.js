import ClientModel from '../../model/usermodel/clientModel.js'
import AdminModel from '../../model/usermodel/adminModel.js'
import jwt from 'jsonwebtoken'

/**
 * This function is used to generate a new primary token for authorization using the refreshtoken
 */

export const generateNewTokenClient = async (req, res) => {
    const { clientId } = req.params;
    if (!clientId) return res.status(200).json({ message: "Admin Id is required! - backend" });

    // token inside the header should be a refresh token/backup token
    const authHeader = req.headers['authorization'];
    const backupTokenClient = authHeader && authHeader.split(' ')[1];
    if (!backupTokenClient) return res.status(401).json({ message: 'Access denied. Backup token is not provided! - backend' });

    const JWT_SECRET = process.env.JWT_SECRET;
    const BACKUP_JWT_SECRET = process.env.BACKUP_JWT_SECRET;

    try {
        const isValidClient = await ClientModel.findById(adminId);
        if (!isValidClient) return res.status(404).json({ message: "Invalid admin Id! Admin not found - Authorization denied!" });

        jwt.verify(backupTokenClient, BACKUP_JWT_SECRET);
        const newToken = jwt.sign({ clientId: isValidClient._id }, JWT_SECRET, { 'expiresIn': '1h' });

        return res.status(200).json({ message: "New token generated successfully! - backend", token: newToken });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') return res.status(409).json({ message: "Invalid token! - backend" });
        if (error.name === 'TokenExpiredError') return res.status(401).json({ message: "Token exprired! - backend" });

        return res.status(500).json({ message: "An unexpected error occured while trying to verify the token! - backend" });
    }
}

export const generateNewTokenAdmin = async (req, res) => {
    const { adminId } = req.params;
    if (!adminId) return res.status(200).json({ message: "Admin Id is required! - backend" });

    // token inside the header should be a refresh token/backup token
    const authHeader = req.headers['authorization'];
    const backupTokenAdmin = authHeader && authHeader.split(' ')[1];
    if (!backupTokenAdmin) return res.status(401).json({ message: 'Access denied. Backup token is not provided! - backend' });

    const JWT_SECRET = process.env.JWT_SECRET;
    const BACKUP_JWT_SECRET = process.env.BACKUP_JWT_SECRET;

    try {
        const isValidAdmin = await AdminModel.findById(adminId);
        if (!isValidAdmin) return res.status(404).json({ message: "Invalid admin Id! Admin not found - Authorization denied!" });

        jwt.verify(backupTokenAdmin, BACKUP_JWT_SECRET);
        const newToken = jwt.sign({ adminId: isValidAdmin._id }, JWT_SECRET, { 'expiresIn': '1h' });

        return res.status(200).json({ message: "New token generated successfully! - backend", token: newToken });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') return res.status(409).json({ message: "Invalid token! - backend" });
        if (error.name === 'TokenExpiredError') return res.status(401).json({ message: "Token exprired! - backend" });

        return res.status(500).json({ message: "An unexpected error occured while trying to verify the token! - backend" });
    }
}
