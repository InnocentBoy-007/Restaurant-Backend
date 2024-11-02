import express from 'express'
// import { placeOrder } from './controlOrder/orderControl.js';
import { placeOrder} from './controlOrder/OrderServerice.js';

const route = express.Router();

route.post("/placeOrder/:id", placeOrder);


//adminPanel
import { addProduct } from './adminPanel/adminControl.js';
route.post("/addProduct", addProduct);
// route.patch("/updateProduct/:id", updateProduct);

export default route;
