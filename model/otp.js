import mongoose from "mongoose";

const OTPschema = new mongoose.Schema({
    OTP: { type: String, required: true },
    expiresAt: { type: Date, required: true }
})

// this collection will lasted for only a specific time-limit
OTPschema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("OTP", OTPschema);
