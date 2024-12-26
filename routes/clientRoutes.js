import express from 'express'

import primaryActions from '../controller/client/accounts/primaryActions.js'; // accounts
import secondaryActions from '../controller/client/accounts/secondaryActions.js'; // accounts

import clientService from '../services/clientService.js'; // service



import { removeFromCart, fetchProductsFromCart } from '../controller/placeCancelOrder.js';
import { clientAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';

import { fetchClientDetails } from '../components/globalObjects/FetchUserDetails.js';

import { generateNewTokenClient } from '../components/tokens/GenerateBackupJWT.js';
import { verifyClient, verifyOTPClient, changePasswordClient } from '../services/passwordManagement/passwordManagement.js';
import { updateClientPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// primary actions (accounts)
router.post("/account/signup", primaryActions.clientSignUp);
router.post("/account/signup/verifyOTP", primaryActions.clientConfirmOTP);
router.post("/account/signin", primaryActions.clientSignIn); // test passed
router.delete("/account/logout", clientAuthMiddleware, primaryActions.clientLogout);


// secondary actions (accounts)
router.post("/account/details/delete", clientAuthMiddleware, secondaryActions.deleteClient); // test passed
router.patch("/account/details/update", clientAuthMiddleware, secondaryActions.updateClient);


// services
router.post("/v1/customers/orders", clientAuthMiddleware, clientService.placeOrder);
router.delete("/v1/customers/orders/cancel/:orderId", clientAuthMiddleware, clientService.cancelOrder);
router.post("/v1/customers/orders/receive_confirm/:orderId", clientAuthMiddleware, clientService.orderReceivedConfirmation);
router.post("/v1/customers/cart/add/:productId", clientAuthMiddleware, clientService.addProductsToCart);




router.get("/account/details", clientAuthMiddleware, fetchClientDetails);


router.delete("/cart/remove/:productId", clientAuthMiddleware, removeFromCart); // test passed
router.get("/cart/products", clientAuthMiddleware, fetchProductsFromCart); // test passed

router.post("/refresh-token/:clientId", generateNewTokenClient); // to generate a new refreshed token (not yet testing)



// routes for changing password(after forgot password) (test passed)
router.post("/forgot-password/verify/email", verifyClient);
router.post("/forgot-password/verify/otp", verifyOTPClient);
router.post("/forget-password/change-password", changePasswordClient);

router.patch("/change-password", clientAuthMiddleware, updateClientPassword);

export default router;
