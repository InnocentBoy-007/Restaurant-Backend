import express from 'express'
import { placeOrder } from './controlOrder/placeOrder.js';
import { acceptOrder } from './controlOrder/acceptOrder.js';
import { rejectOrder } from './controlOrder/rejectOrder.js';
const route = express.Router();


route.post("/placeOrder/:id", placeOrder);


//adminPanel - add or edit the product
import { addProduct, updateProduct } from './adminPanel/adminProductControl.js';
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);

//adminPanel - accept/reject orders
route.patch("/acceptOrder/:id", acceptOrder);
route.patch("/rejectOrder/:id", rejectOrder);
export default route;

//admin Signup-SignIn
import { adminSignUp, adminSignIn } from './adminPanel/adminService.js';
route.post("/adminSignUp", adminSignUp);
route.post("/adminSignIn", adminSignIn);
