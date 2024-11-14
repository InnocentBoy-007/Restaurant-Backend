import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.adminToken; // since I'm using cookies
    // const signInAdminToken = req.cookies.signInAdminToken; // since I'm using cookies
    // console.log("Token-->", token);

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // Attach decoded payload (e.g., adminId) to request
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};
