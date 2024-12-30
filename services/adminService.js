import mongoose from 'mongoose';
import AdminModel from '../model/usermodel/adminModel.js'
import OrderDetails from '../model/orderDetailsModel.js'
import { SentMail } from '../components/middlewares/SentMail.js';
import ProductModel from '../model/productModel.js'
import ClientModel from '../model/usermodel/clientModel.js';

class AdminServices {
    constructor() {
        this.mailer = new SentMail();
    }
    async acceptOrder(req, res) {
        const { orderId } = req.params;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) return res.satus(400).json({ message: "Invalid order Id! - backend" });

        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid adminId! - backend" });

        await this.mailer.setUp();
        try {
            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) return res.status(400).json({ message: "Invalid order Id! Cannot accept an order! - backend" });

            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid adminId! Unauthorized admin has been detected! Authorization revoked! - backend" });

            const isValidClient = await ClientModel.findById(isValidOrder.clientId);
            if (!isValidClient) return res.status(404).json({ message: "Invalid clientId! Client not found! - backend" });

            const isValidProduct = await ProductModel.findById(isValidOrder.productId);
            if (!isValidProduct) return res.status(404).json({ message: "Invalid productId! Product not found in the database! - backend" });

            if (isValidOrder) {
                isValidOrder.orderDispatchedTime = new Date().toLocaleString();
                isValidOrder.status = 'accepted';
                isValidOrder.orderDispatchedBy = isValidAdmin.name;
                await isValidOrder.save();
            }

            const mailInfo = {
                to: isValidOrder.email,
                subject: 'Order Accepted!',
                text: `Thanks, ${isValidClient.title}${isValidClient.clientName} for choosing us and ordering ${isValidOrder.productQuantity} ${isValidOrder.productName}. Please order again. From Innocent Team. Order dispatched at ${isValidOrder.orderDispatchedTime}.`
            }

            await this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.text);

            return res.status(200).json({ message: "Order accepted succesfully! - backend" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to accept an order! - backend" });
        }
    }

    // if rejected, return the orderQuantity to the product database
    async rejectOrder(req, res) {
        const { orderId } = req.params;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ message: "Invalid order Id! - backend" });
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid adminId! - backend" });

        await this.mailer.setUp();
        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid adminId! Authorization revoked! - backend" });

            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) return res.status(404).json({ message: "Invalid order Id! Order not found! - backend" });

            const isValidProduct = await ProductModel.findById(isValidOrder.productId);
            if (!isValidProduct) return res.status(404).json({ message: "Invalid productId! Product not found! - backend" });

            const isValidClient = await ClientModel.findById(isValidOrder.clientId);
            if (!isValidClient) return res.status(404).json({ message: "Invalid clientId! Client not found! - backend" });

            // if everything goes well, return the order quantity to the original database and then delete the order
            isValidProduct.productQuantity += isValidOrder.productQuantity;
            await isValidOrder.deleteOne();

            const receiverInfo = {
                to: isValidClient.email,
                subject: 'Order rejected!',
                text: `Sorry ${isValidClient.title}${isValidClient.name}, your order has been rejected!`
            }

            this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text);

            return res.status(200).json({ message: `Order rejected successfully! Order rejected by ${isValidAdmin.name} - backend` }); // Returns only the deletion message without the deleted orderDetails
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to reject the order! - backend" });
        }
    }

    async fetchOrderDetails(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin (unauthorized) - backend" });
        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(404).json({ message: "Unauthorized admin - backend" });

            const orders = await OrderDetails.find();
            if (!orders) return res.status(404).json({ message: "Orders cannot be fetch! - backend" });

            return res.status(200).json({ orders }); // this returns orders in the form of an object
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to fetch order details! - backend" });
        }
    }
}

const adminServices = new AdminServices();

export default ({
    acceptOrder: adminServices.acceptOrder,
    rejectOrder: adminServices.rejectOrder,
    fetchOrderDetails: adminServices.fetchOrderDetails
})
