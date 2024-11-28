import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn, clientLogOut } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, adminLogOut, fetchAdmins, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware, clientAuthMiddleware } from './components/AuthMiddleware.js';

const route = express.Router();

// *change the routes to RESTful APIs
route.post("/user/signup", clientSignUp);
route.post("/user/signup/verify", clientSignUpVerification);
route.post("/user/signin", clientSignIn);
route.delete("/user/logout", clientAuthMiddleware, clientLogOut);
route.get("/trackOrders/:clientEmail", trackOrderDetails);
route.patch("/addToCart/:clientEmail/:productId", addToCart);
route.delete("/removeFromCart/:productId", clientAuthMiddleware, removeFromCart);
route.get("/fetchOrdersCart/:clientEmail", clientAuthMiddleware, fetchProductsFromCart);
route.post("/placeOrder/:productId", placeOrder);
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
route.post("/adminLogOut", adminAuthMiddleware, adminLogOut);
route.get("/fetchAdmins", fetchAdmins);
route.post("/adminSignIn", adminSignIn);
route.delete("/deleteAdmin/:adminId", deleteAdmin);
route.patch("/updateAdmin/:adminId", updateAdmin);

export default route;
