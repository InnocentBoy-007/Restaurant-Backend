import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    phoneNo: { type: String, required: true },
    email: { type: String, required: true },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 20,
        max: 80
    },
    createdAtLocaleTime: {
        type: String,
        default: () => new Date().toLocaleString()
    },
    updatedAtLocaleTime: {
        type: String,
        default: () => new Date().toLocaleString()
    },
    refreshToken: {
        type: String, select: false
    }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
