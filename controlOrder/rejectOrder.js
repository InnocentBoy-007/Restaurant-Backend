import OrderService from "./OrderServerice.js";
export const rejectOrder = async(req, res) => {
    const {id} = req.params;
    const orderService = new OrderService();
    try {
        const response = await orderService.rejectOrder(id);
        return res.status(200).json({
            message:"Order rejected! - backend",
            response
        })
    } catch (error) {
        if(error instanceof CustomError) {
            res.status(error.errorCode).json({message:error.message})
        }
        res.status(500).json({message:"Internal server error! - backend"})
    }
}
