import mongoose from "mongoose";

const cart = new mongoose.Schema({
    addedProductId: {type:String, required:true},
    addedProductName: {type:String, required:true},
    clientEmail: {type:String, required:true},
    productQuantity: {type:Number, required:true},
    productPrice: {type:Number, required:true},
    totalPrice: {type:Number, required:true},
    addedTime: {type:String, required:true}
})

const cartDetails = mongoose.model("cart", cart);
export default cartDetails;
