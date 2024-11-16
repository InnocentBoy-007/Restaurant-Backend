import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, fetchAdmins, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware, clientAuthMiddleware } from './components/AuthMiddleware.js';

const route = express.Router();

route.post("/clientSignUp", clientSignUp);
route.post("/clientSignUpVerification", clientSignUpVerification);
route.post("/clientSignIn", clientSignIn);
route.get("/trackOrders/:clientEmail", trackOrderDetails);
route.patch("/addToCart/:clientEmail/:productId", addToCart);
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
route.get("/fetchAdmins", fetchAdmins);
route.post("/adminSignIn", adminSignIn);
route.delete("/deleteAdmin/:adminId", deleteAdmin);
route.patch("/updateAdmin/:adminId", updateAdmin);

export default route;
