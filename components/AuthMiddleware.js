import jwt from 'jsonwebtoken';

export const adminAuthMiddleware = (req, res, next) => {
    // const adminToken = req.cookies.adminToken; // since I'm using cookies
    const authHeader = req.headers['authorization'];
    const adminToken = authHeader && authHeader.split(' ')[1];

    if (adminToken === null) return res.status(401).json({ message: "Token is null! - auth backend" });
    if (!adminToken) return res.status(401).json({ message: 'Access denied. No admin token provided.' });
    try {
        const adminTokenDecoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        req.admin = adminTokenDecoded;

        next();
    } catch (err) {
        console.log("Error in admin auth middleware", err);

        res.status(400).json({ message: 'Invalid token.' });
    }
};


export const clientAuthMiddleware = (req, res, next) => {
    // console.log("Headers-->", req.headers); // use this for logging the contents of the headers

    const authHeader = req.headers['authorization'];
    const clientToken = authHeader && authHeader.split(' ')[1];
    // console.log("Client Token inside the auth middleware-->", clientToken);

    if (clientToken === null) return res.status(401).json({ message: "Token is null! - auth backend" });
    if (!clientToken) return res.status(401).json({ message: 'Access denied. No client token provided.' });
    try {
        const clientTokenDecoded = jwt.verify(clientToken, process.env.JWT_SECRET);
        req.client = clientTokenDecoded;
        // console.log("Decoded token--->", req.client);
        // req.clientToken = clientToken;

        next();
    } catch (err) {
        // console.log("Auth error --->", err);
        res.status(400).json({ message: 'Invalid token.' });
    }
};
