import mongoose from "mongoose";

const OTPschema = new mongoose.Schema({
    OTP: {type:String, required:true},
    phoneNo: {type:Number, required:true},
    expiresAt: {type:Date, required:true}
})
OTPschema.index({expiresAt: 1}, {expireAfterSeconds: 0});
export default mongoose.model("OTP", OTPschema);
