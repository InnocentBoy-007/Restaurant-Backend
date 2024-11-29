import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn, clientLogOut } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, adminLogOut, fetchAdmins, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware, clientAuthMiddleware } from './components/AuthMiddleware.js';
import { generateBackUpJWT, adminGenerateBackUpJWT } from './components/GenerateBackupJWT.js';

const route = express.Router();

// *change the routes to RESTful APIs
route.post("/user/signup", clientSignUp);
route.post("/user/signup/verify", clientSignUpVerification);
route.post("/user/signin", clientSignIn);
route.delete("/user/logout", clientAuthMiddleware, clientLogOut);
route.get("/user/orders/:clientEmail", clientAuthMiddleware, trackOrderDetails); // haven't create a UI for this API
route.patch("/user/cart/add/:clientEmail/:productId", addToCart);
route.delete("/user/cart/remove/:productId", clientAuthMiddleware, removeFromCart);
route.get("/user/cart/products/:clientEmail", clientAuthMiddleware, fetchProductsFromCart);
route.post("/user/products/placeorder/:productId", placeOrder);
route.delete("/user/products/cancelorder/:orderId", cancelOrder);
route.patch("/user/confirmorder/:orderId", orderConfirmation);

route.post("/user/refresh-token/:clientId", generateBackUpJWT); // to generate a new refreshed token
route.post("/admin/refresh-token/:adminName", adminGenerateBackUpJWT); // to generate a new refreshed token for admin

route.get("/fetchProduct", fetchProduct);
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);
route.delete("/deleteProduct/:id", deleteProduct);


route.patch("/admin/orders/accept/:orderId/:admin", adminAuthMiddleware, acceptOrder);
route.delete("/admin/orders/reject/:orderId/:admin", adminAuthMiddleware, rejectOrder);
route.get("/admin/orders/:adminName", fetchOrders);


route.post("/admin/signup", adminSignUp);
route.post("/admin/verify", adminVerification);
route.delete("/admin/logout", adminAuthMiddleware, adminLogOut);
route.get("/admin/details", fetchAdmins);
route.post("/admin/signin", adminSignIn);
route.delete("/admin/details/delete/:adminId", deleteAdmin);
route.patch("/admin/details/update/:adminId", updateAdmin);

export default route;
