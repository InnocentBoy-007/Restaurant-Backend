import express from 'express'
const route = express.Router();

import { placeOrder } from './controlOrder/placeOrder.js';
route.post("/placeOrder/:id", placeOrder);


//adminPanel - add or edit the product
import { addProduct } from './adminPanel/addProduct.js';
import { updateProduct } from './adminPanel/updateProduct.js';
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);

//adminPanel - accept/reject orders
import { acceptOrder } from './controlOrder/acceptOrder.js';
route.patch("/acceptOrder/:id", acceptOrder);
import { rejectOrder } from './controlOrder/rejectOrder.js';
route.patch("/rejectOrder/:id", rejectOrder);

//admin Signup-SignIn
import { adminSignUp, adminSignIn } from './adminPanel/adminService.js';
route.post("/adminSignUp", adminSignUp);
route.post("/adminSignIn", adminSignIn);

export default route;
