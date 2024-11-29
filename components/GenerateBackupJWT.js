import Client from '../model/clientModel.js'
import { CustomError } from './CustomError.js';
import jwt from 'jsonwebtoken'

/**
 * This function is used to generate a new primary token for authorization using the refreshtoken
 */
export const generateBackUpJWT = async (req, res) => {
    // the clientId comes from the payload or the token
    const { clientId } = req.params;
    if (!clientId) throw new CustomError("Invalid clientId", 400);
    try {
        const isRefreshToken = await Client.findById(clientId).select("refreshToken"); // this query makes sure that only the value of refreshToken is returned
        if (!isRefreshToken) throw new CustomError("User not found! - backend", 404);

        // validating the refresh token to create a new primary token (middleware)
        const verifyToken = jwt.verify(isRefreshToken.refreshToken, process.env.BACKUP_JWT_SECRET);
        if (!verifyToken) throw new CustomError("Invalid refresh token - backend", 403);

        const payload = await Client.findById(clientId); // fetching the same user detail without the properties marked 'select: false'

        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: '15m' });
        console.log("New token generated --->", token);

        return res.status(200).json(token);
    } catch (error) {
        console.log("Error in the generate backup jwt--->", error);

        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch a refreshed token! - backend" });
    }
}
