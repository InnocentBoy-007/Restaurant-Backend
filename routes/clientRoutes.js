import express from 'express'
import primaryActions from '../controller/client/accounts/primaryActions.js'; // accounts
import secondaryActions from '../controller/client/accounts/secondaryActions.js'; // accounts
import clientService from '../services/clientService.js'; // service
import clientPasswordManagement from '../services/passwordManagement/forgetPassword/client/forgetPassword.js';
import { clientAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';
import { fetchClientDetails } from '../components/globalObjects/FetchUserDetails.js';
import { generateNewTokenClient } from '../components/tokens/GenerateBackupJWT.js';
import changePassword from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// primary actions (accounts)
router.post("/v1/customers/account/signup", primaryActions.clientSignUp);
router.post("/v1/customers/account/signup/verifyOTP", primaryActions.clientConfirmOTP);
router.post("/v1/customers/account/signIn", primaryActions.clientSignIn); // test passed
router.delete("/v1/customers/account/logout", clientAuthMiddleware, primaryActions.clientLogout);


// secondary actions (accounts)
router.post("/v1/customers/account/details/delete", clientAuthMiddleware, secondaryActions.deleteClient); // test passed
router.patch("/v1/customers/account/details/update", clientAuthMiddleware, secondaryActions.updateClient);


// services
// services (orders)
router.post("/v1/customers/orders/place_order", clientAuthMiddleware, clientService.placeOrder);
router.delete("/v1/customers/orders/cancel/:orderId", clientAuthMiddleware, clientService.cancelOrder);
router.post("/v1/customers/orders/receive_confirm/:orderId", clientAuthMiddleware, clientService.orderReceivedConfirmation);
router.get("/v1/customers/orders/track_orders", clientAuthMiddleware, clientService.trackOrderDetails);


// services (cart)
router.post("/v1/customers/cart/:productId/add", clientAuthMiddleware, clientService.addProductsToCart);
router.get("/v1/customers/cart/fetch", clientAuthMiddleware, clientService.fetchProductsFromCart);
router.delete("/v1/customers/cart/:productId/delete", clientAuthMiddleware, clientService.removeProductsFromCart);



router.get("/v1/customers/account/details", clientAuthMiddleware, fetchClientDetails);



router.post("/v1/customers/token/refresh-token/:clientId", generateNewTokenClient); // to generate a new refreshed token (not yet testing)



// routes for changing password(after forgot password) (test passed)
router.post("/v1/customers/password/forgot-password/verify/email", clientPasswordManagement.verifyClient);
router.post("/v1/customers/password/forgot-password/verify/otp", clientAuthMiddleware, clientPasswordManagement.verifyOTP);
router.post("/v1/customers/password/forgot-password/change-password", clientAuthMiddleware, clientPasswordManagement.setNewPassword);

router.patch("/v1/customers/change-password", clientAuthMiddleware, changePassword.ClientChangePassword);

export default router;
