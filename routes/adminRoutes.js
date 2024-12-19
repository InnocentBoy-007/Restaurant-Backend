import express from 'express'

import primaryActions from '../controller/admin/accounts/primaryActions.js'; // manages primary actions for admin accounts
import secondaryActions from '../controller/admin/accounts/secondaryActions.js'; // manages secondary actions for admin accounts


import { acceptOrder, rejectOrder, fetchOrders } from '../adminPanel/adminAcceptRejectOrder.js';
import { adminAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';

import { generateNewTokenAdmin } from '../components/tokens/GenerateBackupJWT.js';

import { fetchAdminDetails } from '../components/globalObjects/FetchUserDetails.js';


import { addProduct, updateProduct, deleteProduct } from '../adminPanel/adminHandleProducts.js';
import { verifyAdmin, verifyOTPAdmin, changePasswordAdmin } from '../services/passwordManagement/passwordManagement.js';
import { updateAdminPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

// primary actions
router.post("/account/signup", primaryActions.adminSignUp);
router.post("/account/signin", primaryActions.adminSignIn);
router.delete("/account/logout", adminAuthMiddleware, primaryActions.adminLogout);


// secondary actions
router.delete("/account/details/delete", adminAuthMiddleware, secondaryActions.deleteAdmin);
router.patch("/account/details/update", adminAuthMiddleware, secondaryActions.updateAdmin);



router.post("/orders/accept/:orderId/:productId", adminAuthMiddleware, acceptOrder); // test passed
router.delete("/orders/reject/:orderId", adminAuthMiddleware, rejectOrder); // test passed
router.get("/orders", adminAuthMiddleware, fetchOrders); // test passed

// generate new token using a refresh token
router.post("/token/:adminId", generateNewTokenAdmin); // testing

router.get("/details", adminAuthMiddleware, fetchAdminDetails); // test passed


router.post("/products/add", adminAuthMiddleware, addProduct); // test passed
router.patch("/products/update/:productId", adminAuthMiddleware, updateProduct); // (testing)
router.delete("/products/delete/:productId", adminAuthMiddleware, deleteProduct); // test passed

// APIs for changing password after forgotten password (testing)
router.post("/forgot-password/verify/email", verifyAdmin);
router.post("/forgot-password/verify/otp", verifyOTPAdmin);
router.patch("/forgot-password/change-password", changePasswordAdmin);

// normal password change
router.patch("/change-password", adminAuthMiddleware, updateAdminPassword);

export default router;
