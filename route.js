import express from 'express'
import { placeOrder, cancelOrder, clientVerification, orderConfirmation, addToCart, addToCartVerification, trackOrderDetails, fetchProductsFromCart } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, fetchAdmins, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware, clientAuthMiddleware } from './components/AuthMiddleware.js';

const route = express.Router();

route.get("/trackOrders", trackOrderDetails);
route.post("/addToCartVerification/:productId", addToCartVerification);
route.patch("/addToCart", addToCart);
route.get("/fetchOrdersCart/:clientEmail", clientAuthMiddleware, fetchProductsFromCart);
route.post("/placeOrder/:productId", placeOrder);
route.post("/otpverify", clientVerification);
route.delete("/cancelOrder/:orderId", cancelOrder);
route.patch("/orderConfirmation/:orderId", orderConfirmation);


route.get("/fetchProduct", fetchProduct);
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);
route.delete("/deleteProduct/:id", deleteProduct);


route.patch("/acceptOrder/:orderId/:admin", adminAuthMiddleware, acceptOrder);
route.delete("/rejectOrder/:orderId/:admin", adminAuthMiddleware, rejectOrder);
route.get("/fetchOrders/:adminName", adminAuthMiddleware, fetchOrders);


route.post("/adminSignUp", adminSignUp);
route.post("/adminVerification", adminVerification);
route.get("/fetchAdmins", fetchAdmins);
route.post("/adminSignIn", adminSignIn);
route.delete("/deleteAdmin/:adminId", deleteAdmin);
route.patch("/updateAdmin/:adminId", updateAdmin);

export default route;
