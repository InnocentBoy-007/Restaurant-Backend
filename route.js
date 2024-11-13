import express from 'express'
import { placeOrder, cancelOrder, clientVerification, orderConfirmation, addToCart, trackOrderDetails, fetchProductsFromCart } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, fetchAdmins, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { authMiddleware } from './components/AuthMiddleware.js';

const route = express.Router();

route.get("/trackOrders", trackOrderDetails);
route.patch("/addToCart/:productId", addToCart);
route.get("/fetchOrdersCart/:productId", fetchProductsFromCart);
route.post("/placeOrder/:productId", placeOrder);
route.post("/otpverify", clientVerification);
route.delete("/cancelOrder/:orderId", cancelOrder);
route.patch("/orderConfirmation/:orderId", orderConfirmation);


route.get("/fetchProduct", fetchProduct);
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);
route.delete("/deleteProduct/:id", deleteProduct);


route.patch("/acceptOrder/:orderId/:admin", authMiddleware, acceptOrder);
route.delete("/rejectOrder/:orderId/:admin", authMiddleware, rejectOrder);
route.get("/fetchOrders", authMiddleware, fetchOrders);


route.post("/adminSignUp", adminSignUp);
route.post("/adminVerification", adminVerification);
route.get("/fetchAdmins", fetchAdmins);
route.post("/adminSignIn", adminSignIn);
route.delete("/deleteAdmin/:adminId", deleteAdmin);
route.patch("/updateAdmin/:adminId", updateAdmin);

// Other protected routes would use the authMiddleware
route.get("/protectedRoute", authMiddleware, (req, res) => {
    res.send("You have access to this protected route.");
});

export default route;
