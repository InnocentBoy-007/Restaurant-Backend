import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    gender: {
        type: String, required: true,
        enum: ['male', 'female']
    },
    password: { type: String, required: true, select: false },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    signUpAt: { type: String, required: true },
    refreshToken: { type: String, select: false }
});

export default mongoose.model("client", clientSchema);
