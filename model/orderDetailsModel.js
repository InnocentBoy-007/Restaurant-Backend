import mongoose from "mongoose";

// first half is client details
// second half is product details
// third half is the timestamp
// fourth half is admin details
// client confirmation

const orderDetailsModel = new mongoose.Schema({
    clientId: { type: mongoose.Types.ObjectId, required: true },
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    phoneNo: { type: String, required: true },

    productId: { type: mongoose.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    productQuantity: { type: Number, required: true }, // * only this property needs to be fetched from frontend

    orderTime: { type: String, required: true },
    orderDispatchedTime: { type: String, default: null },

    acceptedByAdmin: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    orderDispatchedBy: { type: String, require: true },

    receivedByClient: {
        type: Boolean,
        default: false
    }
});

const orderDetails = mongoose.model("orderDetail", orderDetailsModel);
export default orderDetails;
