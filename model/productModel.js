import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productQuantity: { type: Number, required: true },
    productAddedOn: { type: String, required: true },
    productAddedBy: { type: String, required: true },
    productUpdatedOn: { type: String, default: null }, // set to null if not updated
    productUpdatedBy: { type: String, default: null }
})

export default mongoose.model("product", productSchema);
