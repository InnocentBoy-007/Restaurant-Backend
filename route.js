import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn, clientLogOut } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, adminLogOut, fetchAdmins, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware, clientAuthMiddleware } from './components/AuthMiddleware.js';
import { generateBackUpJWT, adminGenerateBackUpJWT } from './components/GenerateBackupJWT.js';
import { fetchAdminDetails, fetchClientDetails } from './components/FetchUserDetails.js';

const route = express.Router();

// *change the routes to RESTful APIs
route.post("/user/signup", clientSignUp);
route.post("/user/signup/verify", clientSignUpVerification);
route.post("/user/signin", clientSignIn);
route.get("/user/details", fetchClientDetails);
route.delete("/user/logout", clientLogOut);
route.get("/user/orders", trackOrderDetails); // haven't create a UI for this API
route.post("/user/cart/add/:productId", addToCart);
route.delete("/user/cart/remove/:productId", removeFromCart);
route.get("/user/cart/products", fetchProductsFromCart);
route.post("/user/products/placeorder", placeOrder);
route.delete("/user/products/cancelorder/:orderId", cancelOrder);
route.post("/user/order/confirm/:orderId", orderConfirmation);

route.post("/user/refresh-token/:clientId", generateBackUpJWT); // to generate a new refreshed token
route.post("/admin/refresh-token", adminGenerateBackUpJWT); // to generate a new refreshed token for admin

route.get("/fetchProduct", fetchProduct);
route.post("/addProduct", addProduct);
route.patch("/updateProduct/:id", updateProduct);
route.delete("/deleteProduct/:id", deleteProduct);


route.post("/admin/orders/accept/:orderId/:productId", acceptOrder);
route.delete("/admin/orders/reject/:orderId", rejectOrder);
route.get("/admin/orders/:adminId", fetchOrders);


route.post("/admin/signup", adminSignUp);
route.post("/admin/verify", adminVerification);
route.get("/admin/adminDetails", fetchAdminDetails);
route.delete("/admin/logout", adminLogOut);
route.get("/admin/details", fetchAdmins);
route.post("/admin/signin", adminSignIn);
route.delete("/admin/details/delete/:adminId", deleteAdmin);
route.patch("/admin/details/update/:adminId", updateAdmin);

export default route;
