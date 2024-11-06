import mongoose from "mongoose";

const orderDetailsModel = new mongoose.Schema({
    orderName:{ type:String, required:true },
    orderProductName:{ type:String, required:true },
    productPrice:{ type:Number, required:true },
    totalPrice:{type:Number, required:true},
    orderQuantity:{ type:Number, required:true },
    orderAddress:{ type:String, required:true },
    orderPhoneNo:{ type:Number, required:true },
    orderTime:{ type:String, required:true },
    orderDispatchedTime:{type:String,default:null},
    acceptedByAdmin: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    orderDispatchedBy: {type:String,require:true},
    receivedByClient:{
        type: Boolean,
        default: false
    }
});

const orderDetails = mongoose.model("orderDetail", orderDetailsModel);
export default orderDetails;
