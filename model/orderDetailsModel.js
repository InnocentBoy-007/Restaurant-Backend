import mongoose from "mongoose";

const orderDetailsModel = new mongoose.Schema({
    orderName:{ type:String, required:true },
    orderProductName:{ type:String, required:true },
    orderPrice:{ type:Number, required:true },
    orderQuantity:{ type:Number, required:true },
    orderAddress:{ type:String, required:true },
    orderPhoneNo:{ type:Number, required:true },
    orderTime:{ type:String, required:true },
    // add dispatched time
    orderDispatchedTime:{type:String,default:null},
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    receivedByClient:{
        type:String,
        enum: ['pending', 'received', 'not received'],
        default: 'pending'
    }
});

const orderDetails = mongoose.model("orderDetail", orderDetailsModel);
export default orderDetails;
