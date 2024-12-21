import express from 'express'

import primaryActions from '../controller/client/accounts/primaryActions.js';
import secondaryActions from '../controller/client/accounts/secondaryActions.js';

import { placeOrder, cancelOrder, orderConfirmation, addToCart, removeFromCart, trackOrderDetails, fetchProductsFromCart, deleteClient, updateClient } from '../controller/placeCancelOrder.js';
import { clientLogOut } from '../controller/placeCancelOrder.js';
import { clientAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';

import { fetchClientDetails } from '../components/globalObjects/FetchUserDetails.js';

import { generateNewTokenClient } from '../components/tokens/GenerateBackupJWT.js';
import { verifyClient, verifyOTPClient, changePasswordClient } from '../services/passwordManagement/passwordManagement.js';
import { updateClientPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// primary actions
router.post("/account/signup", primaryActions.clientSignUp);
router.post("/account/signup/verifyOTP/:clientId", primaryActions.clientConfirmOTP);
router.post("/account/signin", primaryActions.clientSignIn); // test passed
router.delete("/account/logout", clientAuthMiddleware, primaryActions.clientLogout);


// secondary actions
router.post("/account/details/delete", clientAuthMiddleware, secondaryActions.deleteClient); // test passed
router.patch("/account/details/update", clientAuthMiddleware, secondaryActions.updateClient);


router.get("/details", clientAuthMiddleware, fetchClientDetails);


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
