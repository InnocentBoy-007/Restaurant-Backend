import express from 'express'
import { fetchProduct, addProduct, updateProduct, deleteProduct } from '../adminPanel/adminHandleProducts.js';

const route = express.Router();

/**
 * use a single database for both client and admin, seperated by roles
 */

route.get("/products", fetchProduct); // this should be accessible by both admin and client (client side (test passed) | admin side (not yet testing))
route.post("/addProduct", addProduct); // (not yet testing)
route.patch("/updateProduct/:id", updateProduct); // (not yet testing)
route.delete("/deleteProduct/:id", deleteProduct); // (not yet testing)


export default route;
