import express from 'express'
import { placeOrder,cancelOrder, clientVerification, orderConfirmation } from './controlOrder/placeCancelOrder.js';
import { addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn } from './adminPanel/adminSignUpSignIn.js';

const route = express.Router();

route.post("/otpverify", clientVerification);
route.post("/placeOrder/:otpCode", placeOrder);
route.delete("/cancelOrder/:id", cancelOrder);
route.patch("/orderConfirmation", orderConfirmation);


route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);
route.delete("/deleteProduct/:id", deleteProduct);


route.patch("/acceptOrder", acceptOrder);
route.delete("/rejectOrder/:id", rejectOrder);


route.post("/adminSignUp", adminSignUp);
route.post("/adminSignIn", adminSignIn);

export default route;
