import OrderService from "./OrderServerice.js";

export const acceptOrder = async(req, res) => {
    const {id} = req.params;
    const orderService = new OrderService();
    try {
        const response = await orderService.acceptOrder(id);
        return res.status(200).json({
            message:"Order has been dispatched! - backend",
            response
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message:error.message || "Internal server error! - backend"
        })
    }
}
