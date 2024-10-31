import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

const MONGOURL = process.env.MONGOURL;

export const connectDatabase = async() => {
    try {
        await mongoose.connect(MONGOURL+"/coffee");
        console.log("Database connected succesfully!");

    } catch (error) {
        console.log(`Database cannot be connected: ${error}`);

    }
}
