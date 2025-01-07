import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    phoneNo: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    gender: {
        type: String, required: true,
        enum: ['male', 'female']
    },
    title: {
        type: String
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
    },
    otp: {
        type: String
    }
}, { timestamps: true });

adminSchema.pre('save', function (next) {
    if (this.gender === 'male') {
        this.title = 'Mr';
    } else if (this.gender === 'female') {
        this.title = 'Ms';
    }
    next();
});

export default mongoose.model("Admin", adminSchema);
