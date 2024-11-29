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
        // const isRefreshToken = await Client.findById(clientId).select("refreshToken"); // this query makes sure that only the value of refreshToken is returned
        // console.log("Refresh Token --->", isRefreshToken.refreshToken);

        // if (!isRefreshToken) throw new CustomError("User not found! - backend", 404);

        // validating the refresh token to create a new primary token (middleware)
        // const verifyToken = jwt.verify(isRefreshToken.refreshToken, process.env.JWT_SECRET);
        // if (!verifyToken) throw new CustomError("Invalid refresh token - backend", 403);

        const authHeader = req.headers['authorization'];
        const clientToken = authHeader && authHeader.split(' ')[1]; // refresh token

        if (clientToken === null) return res.status(401).json({ message: "Token is null! - auth backend" });
        if (!clientToken) return res.status(401).json({ message: 'Access denied. No client token provided.' });

        const getTokenFromDB = await Client.findById(clientId).select("refreshToken");
        if (!getTokenFromDB) throw new CustomError("Token not found! - backend", 404);

        if (clientToken !== getTokenFromDB) throw new CustomError("Incorrect token! New token generation failed! - backend", 500);

        const payload = req.client; // fetching the previous payload

        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: '15s' }); // need testing
        console.log("New token generated --->", token);

        return res.status(200).json(token);
    } catch (error) {
        console.log("Error in the generate backup jwt--->", error);

        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch a refreshed token! - backend" });
    }
}
