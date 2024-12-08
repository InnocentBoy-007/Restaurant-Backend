import express from 'express'

import { acceptOrder, rejectOrder, fetchOrders } from '../adminPanel/adminAcceptRejectOrder.js';
import { adminSignUp, adminSignIn, adminVerification, adminLogOut, deleteAdmin, updateAdmin } from '../adminPanel/adminSignUpSignIn.js';
import { adminAuthMiddleware } from '../components/middlewares/AuthMiddleware.js';
import { adminGenerateBackUpJWT } from '../components/middlewares/GenerateBackupJWT.js';
import { fetchAdminDetails } from '../components/FetchUserDetails.js';

const router = express.Router();

router.post("/refresh-token", adminGenerateBackUpJWT); // to generate a new refreshed token for admin (not yet testing)
router.post("/orders/accept/:orderId/:productId", adminAuthMiddleware, acceptOrder); // test passed
router.delete("/orders/reject/:orderId", adminAuthMiddleware, rejectOrder); // test passed
router.get("/orders", adminAuthMiddleware, fetchOrders); // test passed


router.post("/signup", adminSignUp); // test passed
router.post("/verify", adminVerification); // test passed
router.post("/signin", adminSignIn); // test passed
router.get("/details", adminAuthMiddleware, fetchAdminDetails); // test passed
router.delete("/logout", adminLogOut); // test passed
router.delete("/details/delete", adminAuthMiddleware, deleteAdmin); // test passed
router.patch("/details/update", adminAuthMiddleware, updateAdmin); // test passed

export default router;
