import express from 'express'

import primaryActions from '../controller/admin/accounts/primaryActions.js'; // manages primary actions for admin accounts
import secondaryActions from '../controller/admin/accounts/secondaryActions.js'; // manages secondary actions for admin accounts

import adminService from '../services/adminService.js';

import productControl from '../controller/admin/products/productControl.js';

import { adminAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';
import { generateNewTokenAdmin } from '../components/tokens/GenerateBackupJWT.js';

import { fetchAdminDetails } from '../components/globalObjects/FetchUserDetails.js';

import { verifyAdmin, verifyOTPAdmin, changePasswordAdmin } from '../services/passwordManagement/passwordManagement.js';
import { updateAdminPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// primary actions
router.post("/account/signup", primaryActions.adminSignUp);
router.post("/account/signup/verifyOTP", primaryActions.adminConfirmOTP);
router.post("/account/signin", primaryActions.adminSignIn);
router.delete("/account/logout", adminAuthMiddleware, primaryActions.adminLogout);


// secondary actions
router.delete("/account/details/delete", adminAuthMiddleware, secondaryActions.deleteAdmin);
router.patch("/account/details/update", adminAuthMiddleware, secondaryActions.updateAdmin);


// admin services
router.post("/v1/admin/orders/accept_order/:orderId", adminAuthMiddleware, adminService.acceptOrder);
router.delete("/v1/admin/orders/reject_order/:orderId", adminAuthMiddleware, adminService.rejectOrder);
router.get("/v1/admin/orders/fetch_orders", adminAuthMiddleware, adminService.fetchOrderDetails);


// admin product controller routes
router.post("/v1/admin/products/add_product", adminAuthMiddleware, productControl.addProduct);
router.patch("/v1/admin/products/update_product/:productId", adminAuthMiddleware, productControl.updateProduct);
router.delete("/v1/admin/products/delete_product/:productId", adminAuthMiddleware, productControl.deleteProduct);





// generate new token using a refresh token
router.post("/token/:adminId", generateNewTokenAdmin); // testing

router.get("/details", adminAuthMiddleware, fetchAdminDetails); // test passed


// APIs for changing password after forgotten password (testing)
router.post("/forgot-password/verify/email", verifyAdmin);
router.post("/forgot-password/verify/otp", verifyOTPAdmin);
router.patch("/forgot-password/change-password", changePasswordAdmin);

// normal password change
router.patch("/change-password", adminAuthMiddleware, updateAdminPassword);

export default router;
