import express from 'express'

import { acceptOrder, rejectOrder, fetchOrders } from '../adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, adminLogOut, deleteAdmin, updateAdmin } from '../adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';

import { generateNewTokenAdmin } from '../components/middlewares/GenerateBackupJWT.js';

import { fetchAdminDetails } from '../components/FetchUserDetails.js';
import { addProduct, updateProduct, deleteProduct } from '../adminPanel/adminHandleProducts.js';
import { verifyAdmin, verifyOTPAdmin, changePasswordAdmin } from '../services/passwordManagement/passwordManagement.js';
import { updateAdminPassword } from '../services/passwordManagement/changePassword.js';

const router = express.Router();

router.post("/orders/accept/:orderId/:productId", adminAuthMiddleware, acceptOrder); // test passed
router.delete("/orders/reject/:orderId", adminAuthMiddleware, rejectOrder); // test passed
router.get("/orders", adminAuthMiddleware, fetchOrders); // test passed

// generate new token using a refresh token
router.post("/token/:adminId", generateNewTokenAdmin); // testing

router.post("/signup", adminSignUp); // test passed
router.post("/verify", adminVerification); // test passed
router.post("/signin", adminSignIn); // test passed
router.get("/details", adminAuthMiddleware, fetchAdminDetails); // test passed
router.delete("/logout", adminLogOut); // test passed
router.post("/details/delete", adminAuthMiddleware, deleteAdmin); // test passed
router.patch("/details/update", adminAuthMiddleware, updateAdmin); // test passed

router.post("/products/add", adminAuthMiddleware, addProduct); // test passed
router.patch("/products/update/:productId", adminAuthMiddleware, updateProduct); // (testing)
router.delete("/products/delete/:productId", adminAuthMiddleware, deleteProduct); // test passed

// APIs for changing password after forgotten password
router.post("/forgot-password/verify/email", verifyAdmin);
router.post("/forgot-password/verify/otp", verifyOTPAdmin);
router.post("/forgot-password/change-password", changePasswordAdmin);

// normal password change
router.patch("/change-password", adminAuthMiddleware, updateAdminPassword);

export default router;
