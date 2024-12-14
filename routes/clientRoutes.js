import express from 'express'
import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, clientSignUp, clientSignUpVerification, clientSignIn, clientLogOut, deleteClient, updateClient } from '../controlOrder/placeCancelOrder.js';
import { clientAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';
import { fetchClientDetails } from '../components/FetchUserDetails.js';
import { generateNewTokenClient } from '../components/middlewares/GenerateBackupJWT.js';
import { verifyClient, verifyOTPClient, changePasswordClient } from '../services/passwordManagement/passwordManagement.js';
import { updateClientPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// add an API for FORGET PASSWORD
router.post("/signup", clientSignUp); // test passed
router.post("/signup/verify", clientSignUpVerification); // test passed
router.post("/signin", clientSignIn); // test passed
router.get("/details", clientAuthMiddleware, fetchClientDetails); // test passed
router.delete("/logout", clientLogOut); // test passed
router.post("/details/delete", clientAuthMiddleware, deleteClient); // test passed
router.patch("/profile/update", clientAuthMiddleware, updateClient); // test passed
router.get("/orders/:email", clientAuthMiddleware, trackOrderDetails); // haven't create a UI for this API
router.post("/cart/add/:productId", clientAuthMiddleware, addToCart); // test passed
router.delete("/cart/remove/:productId", clientAuthMiddleware, removeFromCart); // test passed
router.get("/cart/products", clientAuthMiddleware, fetchProductsFromCart); // test passed
router.post("/products/placeorder", clientAuthMiddleware, placeOrder); // test passed
router.delete("/products/cancelorder/:orderId", cancelOrder); // (not yet testing)
router.post("/order/confirm/:orderId/:email", clientAuthMiddleware, orderConfirmation); // test passed

router.post("/refresh-token/:clientId", generateNewTokenClient); // to generate a new refreshed token (not yet testing)

// routes for changing password(after forgot password) (test passed)
router.post("/forgot-password/verify/email", verifyClient);
router.post("/forgot-password/verify/otp", verifyOTPClient);
router.post("/forget-password/change-password", changePasswordClient);

router.patch("/change-password", clientAuthMiddleware, updateClientPassword);

export default router;
