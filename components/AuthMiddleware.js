import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const adminToken = req.cookies.adminToken; // since I'm using cookies
    const clientToken = req.cookies.clientToken;
    if (!adminToken) return res.status(401).json({ message: 'Access denied. No admin token provided.' });
    if (!clientToken) return res.status(401).json({ message: 'Access denied. No client token provided.' });

    try {
        const adminTokenDecoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        req.admin = adminTokenDecoded;

        const clientTokenDecoded = jwt.verify(clientToken, process.env.JWT_SECRET);
        req.client = clientTokenDecoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};
