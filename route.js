import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn, clientLogOut } from './controlOrder/placeCancelOrder.js';
import { fetchProduct, addProduct, updateProduct, deleteProduct } from './adminPanel/adminHandleProducts.js';
import { acceptOrder, rejectOrder, fetchOrders } from './adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, adminLogOut, deleteAdmin, updateAdmin } from './adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware, clientAuthMiddleware } from './components/AuthMiddleware.js';
import { generateBackUpJWT, adminGenerateBackUpJWT } from './components/GenerateBackupJWT.js';
import { fetchAdminDetails, fetchClientDetails } from './components/FetchUserDetails.js';

const route = express.Router();

// *change the routes to RESTful APIs
// add an API for FORGET PASSWORD
route.post("/user/signup", clientSignUp); // test passed
route.post("/user/signup/verify", clientSignUpVerification); // test passed
route.post("/user/signin", clientSignIn); // test passed
route.get("/user/details", clientAuthMiddleware, fetchClientDetails); // test passed
route.delete("/user/logout", clientLogOut); // test passed
route.get("/user/orders/:email", clientAuthMiddleware, trackOrderDetails); // haven't create a UI for this API
route.post("/user/cart/add/:productId", clientAuthMiddleware, addToCart); // test passed
route.delete("/user/cart/remove/:productId", clientAuthMiddleware, removeFromCart); // test passed
route.get("/user/cart/products", clientAuthMiddleware, fetchProductsFromCart); // test passed
route.post("/user/products/placeorder", clientAuthMiddleware, placeOrder); // test passed
route.delete("/user/products/cancelorder/:orderId", cancelOrder); // (not yet testing)
route.post("/user/order/confirm/:orderId/:email", clientAuthMiddleware, orderConfirmation);

route.post("/user/refresh-token/:clientId", generateBackUpJWT); // to generate a new refreshed token (not yet testing)
route.post("/admin/refresh-token", adminGenerateBackUpJWT); // to generate a new refreshed token for admin (not yet testing)

route.get("/products", fetchProduct); // this should be accessible by both admin and client (client side (test passed) | admin side (not yet testing))
route.post("/addProduct", addProduct); // (not yet testing)
route.patch("/updateProduct/:id", updateProduct); // (not yet testing)
route.delete("/deleteProduct/:id", deleteProduct); // (not yet testing)


route.post("/admin/orders/accept/:orderId/:productId", adminAuthMiddleware, acceptOrder); // test passed
route.delete("/admin/orders/reject/:orderId", adminAuthMiddleware, rejectOrder); // test passed
route.get("/admin/orders", adminAuthMiddleware, fetchOrders); // test passed


route.post("/admin/signup", adminSignUp); // test passed
route.post("/admin/verify", adminVerification); // test passed
route.post("/admin/signin", adminSignIn); // test passed
route.get("/admin/details", adminAuthMiddleware, fetchAdminDetails); // test passed
route.delete("/admin/logout", adminLogOut); // test passed
route.delete("/admin/details/delete", adminAuthMiddleware, deleteAdmin); // test passed
route.patch("/admin/details/update", adminAuthMiddleware, updateAdmin); // test passed

export default route;
