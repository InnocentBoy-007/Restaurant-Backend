import express from 'express'
import { placeOrder } from './controlOrder/orderControl.js';

const route = express.Router();

route.post("/placeOrder/:id", placeOrder);


//adminPanel
import { addProduct } from './adminPanel/addDeleteProducts.js';
route.post("/addProduct", addProduct);

export default route;
