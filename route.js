import express from 'express'
const route = express.Router();

import { placeOrder } from './controlOrder/placeOrder.js';
route.post("/placeOrder/:id", placeOrder);

//adminPanel - add or edit the product
import { addProduct, updateProduct } from './adminPanel/adminHandleProducts.js';
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);

//adminPanel - accept/reject orders
import { acceptOrder } from './adminPanel/adminAcceptOrder.js';
import { rejectOrder } from './adminPanel/adminRejectOder.js';
route.patch("/acceptOrder/:id", acceptOrder);
route.patch("/rejectOrder/:id", rejectOrder);

//admin Signup-SignIn
import { adminSignUp, adminSignIn } from './adminPanel/adminSignUpSignIn.js';
route.post("/adminSignUp", adminSignIn);
route.post("/adminSignIn", adminSignIn);

export default route;
