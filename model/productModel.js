import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    productPrice:{
        type:Number,
        required:true
    },
    productQuantity:{
        type:Number,
        required:true
    },
    productAddedOn:{
        type:String,
        required:true
    },
    productUpdatedOn:{
        type:String,
        default:null // set to null if not updated
    }
})

export default mongoose.model("product", productSchema);
