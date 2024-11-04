import express from 'express'
import mongoose from "mongoose";
import cors from 'cors'
import dotenv from 'dotenv'
import route from './route.js';

class CustomError extends Error{
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}

class ServerSetUp{
    constructor() {
        dotenv.config();
        this.PORT = process.env.PORT;
        this.MONGO_URL = process.env.MONGO_URL;
        this.connectServer();
    }

    async connectDatabase() {
        try {
            await mongoose.connect(`${this.MONGO_URL}/coffee`);
            console.log("Database connected succesfully! - backend");
        } catch (error) {
            throw new CustomError("Database cannot be connected! - backend", 400);
        }
    }

    async connectServer() {
        try {
            await this.connectDatabase();
            const app = express();

            // middlewares
            app.use(express.json());
            app.use(cors());

            app.use("/api", route);

            // Global error handler
            app.use((err, req, res, next) => {
                if (err instanceof CustomError) {
                    res.status(err.errorCode).json({ message: err.message });
                } else {
                    res.status(500).json({ message: "Internal Server Error" });
                }
            });

            app.listen(this.PORT || 3000, `0.0.0.0`, ()=> {
                console.log(`Database connected at port: ${this.PORT}`)
            })
            console.log("Server setup successfully! - backend");
        } catch (error) {
            console.log(error);
            throw new CustomError("Server cannot be created! - backend", 500);
        }
    }
}

new ServerSetUp();
