import express from 'express'
import mongoose from "mongoose"; //ODM (Object Data Modeling) library for MongoDB and NodeJs
import cors from 'cors'
import dotenv from 'dotenv'
import route from './route.js';
import { CustomError } from './components/CustomError.js';
/**
 * The CustomError class extends the built-in Error class.
    It adds an additional property errorCode to provide more context about the error.
 */

class ServerSetUp { // This class encapsulates all the logic related to setting up the server and connecting to the database (encapsulates the main methods)
    /**
     * the constructor can be used to declare and initialize instance variables (or "global variables" within the context of the class) that will be accessible throughout the class methods.
     * However, these variables are not global in the broader sense (like global variables in JavaScript); they are scoped to the instance of the ServerSetUp class.
     */
    constructor() {
        dotenv.config(); // loads environment variables using 'dotenv.config()'

        // instance variables
        /**
         * Instance variables (this.PORT, this.MONGO_URL) are used to store configuration values, keeping them private to the instance of the class.
         * Initializes this.PORT and this.MONGO_URL with values from the environment.
         */
        this.PORT = process.env.PORT;
        this.MONGO_URL = process.env.MONGO_URL;

        /**
         * The instance method 'this.connectServer()' will be automatically called when the instance of the dependant class is created
         */
        this.connectServer(); // instance method
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
            app.use(express.json()); // parses incoming JSON requests
            app.use(cors()); // enables CORS for the application
            app.use("/api", route); // Sets up routing for the API

            // Global error handler
            app.use((err, req, res, next) => {
                if (err instanceof CustomError) {
                    return res.status(err.errorCode).json({ message: err.message });
                } else {
                    console.log("Global error ----> ", err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            });

            app.listen(this.PORT || 3000, `0.0.0.0`, () => {
                console.log(`Database connected at port: ${this.PORT}`)
            })
            console.log("Server setup successfully! - backend");
        } catch (error) {
            console.log(error);
            throw new CustomError("Server cannot be created! - backend", 500);
        }
    }
}

/**
 * The constructor method (constructor()) is called when an instance of the class is created. It initializes the instance variables and starts the server setup process by calling this.connectServer().
 */

new ServerSetUp(); // instance of the class ServerSetUp
