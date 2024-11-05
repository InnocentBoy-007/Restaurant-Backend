import express from 'express'
import { placeOrder,cancelOrder } from './controlOrder/placeRejectOrder.js';
import { addProduct, updateProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder } from './adminPanel/adminAcceptOrder.js';
import { rejectOrder } from './adminPanel/adminRejectOder.js';
import { adminSignUp, adminSignIn } from './adminPanel/adminSignUpSignIn.js';
const route = express.Router();

route.post("/placeOrder/:id", placeOrder);
route.delete("/cancelOrder/:id", cancelOrder);


route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);


route.patch("/acceptOrder/:id", acceptOrder);
route.delete("/rejectOrder/:id", rejectOrder);


route.post("/adminSignUp", adminSignUp);
route.post("/adminSignIn", adminSignIn);

export default route;
