import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDatabase } from './database.js';
import route from './route.js';

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());

app.use("/api", route);

const connectServer = async() => {
    const PORT = process.env.PORT;
    try {
        await connectDatabase();
        app.listen(PORT || 5000, `0.0.0.0`, () => {
            console.log(`Server listening at port: ${PORT}`);
        })
        console.log("Server setup successfully!");

    } catch (error) {
        console.log(`Server setup failed: ${error}`);
    }
}

connectServer();
