import mongoose from "mongoose";

const cart = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, required: true },
    email: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    addedTime: { type: String, required: true }
})

const cartDetails = mongoose.model("cart", cart);
export default cartDetails;
