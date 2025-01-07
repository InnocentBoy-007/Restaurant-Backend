import express from 'express'
import primaryActions from '../controller/admin/accounts/primaryActions.js'; // manages primary actions for admin accounts
import secondaryActions from '../controller/admin/accounts/secondaryActions.js'; // manages secondary actions for admin accounts
import adminServices from '../services/adminService.js';
import productControl from '../controller/admin/products/productControl.js';
import { adminAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';
import { generateNewTokenAdmin } from '../components/tokens/GenerateBackupJWT.js';
import { fetchAdminDetails } from '../components/globalObjects/FetchUserDetails.js';
import adminPasswordManagement from '../services/passwordManagement/forgetPassword/admin/forgetPassword.js';
import { updateAdminPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// primary actions
router.post("/account/signup", primaryActions.adminSignUp);
router.post("/account/signup/verifyOTP", adminAuthMiddleware, primaryActions.adminConfirmOTP);
router.post("/account/signin", primaryActions.adminSignIn);
router.delete("/account/logout", adminAuthMiddleware, primaryActions.adminLogout);


// secondary actions
router.post("/account/details/delete", adminAuthMiddleware, secondaryActions.DeleteAdmin);
router.patch("/account/details/update", adminAuthMiddleware, secondaryActions.UpdateAdmin);


// admin services
router.post("/v1/admin/orders/accept_order/:orderId", adminAuthMiddleware, adminServices.acceptOrder);
router.delete("/v1/admin/orders/reject_order/:orderId", adminAuthMiddleware, adminServices.rejectOrder);
router.get("/v1/admin/orders/fetch_orders", adminAuthMiddleware, adminServices.fetchOrderDetails);


// admin product controller routes
router.post("/v1/admin/products/add_product", adminAuthMiddleware, productControl.addProduct);
router.patch("/v1/admin/products/update_product/:productId", adminAuthMiddleware, productControl.updateProduct);
router.delete("/v1/admin/products/delete_product/:productId", adminAuthMiddleware, productControl.deleteProduct);





// generate new token using a refresh token
router.post("/token/:adminId", generateNewTokenAdmin); // testing

router.get("/v1/admin/user-details", adminAuthMiddleware, fetchAdminDetails); // test passed


// APIs for changing password after forgotten password (testing)
router.post("/v1/admin/password/forgot-password/verify/email", adminPasswordManagement.verifyAdmin);
router.post("/v1/admin/password/forgot-password/verify/otp", adminAuthMiddleware, adminPasswordManagement.verifyOTP);
router.patch("/v1/admin/password/forgot-password/change-password", adminAuthMiddleware, adminPasswordManagement.changePassword);

// normal password change
router.patch("/change-password", adminAuthMiddleware, updateAdminPassword);

export default router;
