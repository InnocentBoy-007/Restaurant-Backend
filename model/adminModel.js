import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    adminName: { type: String, required: true },
    adminPhoneNo: { type: String, required: true },
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
    createdAtLocaleTime: { type: String },
    updatedAtLocaleTime: { type: String }
}, { timestamps: true });

// Pre-save hook to convert timestamps to locale strings
adminSchema.pre("save", function (next) {
    if (this.isNew || this.isModified("createdAt")) {
        this.createdAtLocaleTime = this.createdAt.toLocaleString();
    }
    if (this.isNew || this.isModified("updatedAt")) {
        this.updatedAtLocaleTime = this.updatedAt.toLocaleString();
    }
    next();
});

export default mongoose.model("Admin", adminSchema);
