import jwt from 'jsonwebtoken';

export const adminAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const adminToken = authHeader && authHeader.split(' ')[1];

    if (!adminToken) return res.status(401).json({ message: 'Access denied. No admin token provided.' });
    try {
        const verifyTokenAndDecoding = jwt.verify(adminToken, process.env.JWT_SECRET);
        req.adminId = verifyTokenAndDecoding.adminId;

        next();
    } catch (err) {
        console.error("Error in admin auth middleware", err);
        if (err.name == 'JsonWebTokenError') return res.status(409).json({ message: "Invalid token! Authorization denied! - backend" });
        if (err.name == 'TokenExpiredError') return res.status(401).json({ message: "Token expired! Authrorization denied! - backend" })
        return res.status(500).json({ message: "An unexpected error occured while trying to verify the token - backend" });
    }
};


export const clientAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const clientToken = authHeader && authHeader.split(' ')[1];

    if (!clientToken) return res.status(401).json({ message: 'Access denied. No client token provided.' });
    try {
        const clientTokenDecoded = jwt.verify(clientToken, process.env.JWT_SECRET);
        req.clientId = clientTokenDecoded.clientId;

        next();
    } catch (err) {
        console.error("Error in admin auth middleware", err);
        if (err.name == 'JsonWebTokenError') return res.status(409).json({ message: "Invalid token! Authorization denied! - backend" });
        if (err.name == 'TokenExpiredError') return res.status(401).json({ message: "Token expired! Authrorization denied! - backend" })
        return res.status(500).json({ message: "An unexpected error occured while trying to verify the token - backend" });
    }
};
