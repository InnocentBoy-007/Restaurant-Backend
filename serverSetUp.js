import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import AdminRoute from './routes/adminRoutes.js';
import ClientRoute from './routes/clientRoutes.js';
import route from './routes/route.js';
import cookieParser from 'cookie-parser';

class ServerSetUp {
    constructor() {
        dotenv.config();
        this.PORT = process.env.PORT || 8000; // Default to 8000 if PORT is not set
        this.MONGO_URL = process.env.MONGO_URL;
        this.connectServer();
    }

    async connectDatabase() {
        try {
            await mongoose.connect(this.MONGO_URL);
            console.log("Database connected successfully!");
        } catch (error) {
            console.error("Database connection failed!");
        }
    }

    async connectServer() {
        try {
            await this.connectDatabase();
            const app = express();

            // CORS setup
            const allowedOrigins = [
                'https://innocentboy-restaurant-admin.netlify.app', // Production URL
                'http://localhost:4000', // Local URL for development
            ];

            const corsOptions = {
                origin: (origin, callback) => {
                    if (allowedOrigins.includes(origin) || !origin) {
                        callback(null, true);
                    } else {
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization'],
            };

            app.use(cors(corsOptions)); // Enable CORS middleware

            // Middleware setup
            app.use(express.json());
            app.use(cookieParser());

            // Route setup
            app.use("/api", route);
            app.use("/api/client", ClientRoute);
            app.use("/api/admin", AdminRoute);

            // Handle preflight requests (OPTIONS)
            app.options('*', cors(corsOptions));

            // Global error handler
            app.use((err, req, res, next) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                } else {
                    console.log("Global error ----> ", err);
                    return res.status(500).json({ message: "Internal Server Error - global error" });
                }
            });

            // Server listen
            app.listen(this.PORT, `0.0.0.0`, () => {
                console.log(`Server is running on port ${this.PORT}`);
            });
            console.log("Server setup successfully!");
        } catch (error) {
            console.error("Server setup failed", error);
        }
    }
}

// Start server setup
new ServerSetUp();
