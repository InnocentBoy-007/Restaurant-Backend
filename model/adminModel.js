import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    adminName: { type: String, required: true },
    password: { type: String, required: true, select: false },
    adminPhoneNo: { type: String, required: true },
    adminEmail: { type: String, required: true },
    adminGender: {
        type: String,
        enum: ['male', 'female', 'default'],
        default: 'default',
        required: true
    },
    adminAge: {
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
    }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
