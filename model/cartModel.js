import mongoose from "mongoose";

const cart = new mongoose.Schema({
    clientId: { type: mongoose.Types.ObjectId, required: true }, // Id of the client who added the product
    productId: { type: mongoose.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productQuantity: { type: Number, required: true },
    addedTime: { type: String, required: true }
});

const cartDetails = mongoose.model("cart", cart);
export default cartDetails;
