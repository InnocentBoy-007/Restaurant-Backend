import express from 'express'
const route = express.Router();

import { placeOrder,cancelOrder } from './controlOrder/placeRejectOrder.js';
route.post("/placeOrder/:id", placeOrder);
route.delete("/cancelOrder/:id", cancelOrder);

//adminPanel - add or edit the product
import { addProduct, updateProduct } from './adminPanel/adminHandleProducts.js';
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);

//adminPanel - accept/reject orders
import { acceptOrder } from './adminPanel/adminAcceptOrder.js';
import { rejectOrder } from './adminPanel/adminRejectOder.js';
route.patch("/acceptOrder/:id", acceptOrder);
route.delete("/rejectOrder/:id", rejectOrder);

//admin Signup-SignIn
import { adminSignUp, adminSignIn } from './adminPanel/adminSignUpSignIn.js';
route.post("/adminSignUp", adminSignIn);
route.post("/adminSignIn", adminSignIn);

export default route;
