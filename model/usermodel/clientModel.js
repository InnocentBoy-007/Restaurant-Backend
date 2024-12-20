import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    gender: {
        type: String, required: true,
        enum: ['male', 'female']
    },
    title: {
        type: String
    },
    password: { type: String, required: true, select: false },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    signUpAt: { type: String, required: true },
    otp: { type: String }
});

clientSchema.pre('save', function (next) {
    if (this.gender === 'male') {
        this.title = 'Mr';
    } else if (this.gender === 'female') {
        this.title = 'Ms';
    }
    next();
});


export default mongoose.model("client", clientSchema);
