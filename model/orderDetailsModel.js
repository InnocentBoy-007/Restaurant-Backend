import mongoose from "mongoose";

const orderDetailsModel = new mongoose.Schema({
    orderName:{ type:String, required:true },
    orderProductName:{ type:String, required:true },
    orderPrice:{ type:Number, required:true },
    orderQuantity:{ type:Number, required:true },
    orderAddress:{ type:String, required:true },
    orderPhoneNo:{ type:Number, required:true },
    orderTime:{ type:String, required:true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
});

const orderDetails = mongoose.model("orderDetail", orderDetailsModel);
export default orderDetails;
