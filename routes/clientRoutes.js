import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn, clientLogOut } from '../controlOrder/placeCancelOrder.js';
import { clientAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';
import { fetchClientDetails } from '../components/FetchUserDetails.js';
import { generateBackUpJWT } from '../components/middlewares/GenerateBackupJWT.js';

const router = express.Router();

// add an API for FORGET PASSWORD
router.post("/signup", clientSignUp); // test passed
router.post("/signup/verify", clientSignUpVerification); // test passed
router.post("/signin", clientSignIn); // test passed
router.get("/details", clientAuthMiddleware, fetchClientDetails); // test passed
router.delete("/logout", clientLogOut); // test passed
router.get("/orders/:email", clientAuthMiddleware, trackOrderDetails); // haven't create a UI for this API
router.post("/cart/add/:productId", clientAuthMiddleware, addToCart); // test passed
router.delete("/cart/remove/:productId", clientAuthMiddleware, removeFromCart); // test passed
router.get("/cart/products", clientAuthMiddleware, fetchProductsFromCart); // test passed
router.post("/products/placeorder", clientAuthMiddleware, placeOrder); // test passed
router.delete("/products/cancelorder/:orderId", cancelOrder); // (not yet testing)
router.post("/order/confirm/:orderId/:email", clientAuthMiddleware, orderConfirmation);

router.post("/refresh-token/:clientId", generateBackUpJWT); // to generate a new refreshed token (not yet testing)

export default router;
