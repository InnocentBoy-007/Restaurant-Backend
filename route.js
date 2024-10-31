import express from 'express'
import { placeOrder } from './controlOrder/orderControl.js';

const route = express.Router();

route.post("/placeOrder/:id", placeOrder);


//adminPanel
import { addProduct, updateProduct } from './adminPanel/addDeleteProducts.js';
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);

export default route;
