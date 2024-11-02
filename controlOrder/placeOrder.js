import OrderService from "./OrderServerice.js";

export const placeOrder = async (req, res) => {
    const { id } = req.params;
    const { orderDetails } = req.body;
    const orderService = new OrderService();

    try {
        const response = await orderService.placeOrder(id, orderDetails);
        return res.status(200).json(response)

    } catch (error) {
        res.status(error.errorCode || 500).json({
            error: error.message || "Internal server error! - backend"
        })
    }
}
