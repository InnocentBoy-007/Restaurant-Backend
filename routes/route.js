import express from 'express'
import { fetchProducts } from '../components/globalObjects/FetchProductDetails.js';

const route = express.Router();

/**
 * use a single database for both client and admin, seperated by roles
 */

// http://localhost:8000/api/products
route.get("/product/details", fetchProducts); // this should be accessible by both admin and client (client side (test passed) | admin side (not yet testing))

export default route;
