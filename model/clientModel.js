import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    signUpAt: { type: String, required: true },
    refreshToken: { type: String, required: true, select: false } // this property is marked 'select: false' for security purpose
});

export default mongoose.model("client", clientSchema);
