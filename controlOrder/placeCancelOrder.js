import { OrderService } from "../services/clientService.js";
import { CustomError } from "../components/CustomError.js";

const orderService = new OrderService();

// Controller functions of OrderService class (standalone functions)

export const clientSignUp = async (req, res) => {
    const { clientDetails } = req.body;
    try {
        const response = await orderService.clientSignUp(clientDetails);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const clientSignUpVerification = async (req, res) => {
    const { otp } = req.body;
    try {
        const response = await orderService.clientSignUpVerification(otp);
        return res.status(201).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const clientSignIn = async (req, res) => {
    const { clientDetails } = req.body;
    try {
        const response = await orderService.clientSignIn(clientDetails);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// needs review (bug)
export const clientLogOut = async (req, res) => {
    try {
        const clientToken = req.client;

        const response = await orderService.clientLogout(clientToken);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const trackOrderDetails = async (req, res) => {
    req.client.clientToken;
    const { clientEmail } = req.params;
    try {
        const response = await orderService.trackOrderDetails(clientEmail);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const addToCart = async (req, res) => {
    const { clientEmail, productId } = req.params;
    try {
        const response = await orderService.addToCart(clientEmail, productId);
        return res.status(201).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// test passed
export const removeFromCart = async (req, res) => {
    req.client.clientToken;
    const { productId } = req.params;
    try {
        const response = await orderService.removeProductFromCart(productId);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const fetchProductsFromCart = async (req, res) => {
    try {
        const clientEmail = req.client.clientDetails.email;
        // console.log("ClientEmail from controller --->", clientEmail);

        const response = await orderService.fetchProductsFromCart(clientEmail);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const placeOrder = async (req, res) => {
    const { productId } = req.params;
    const { clientDetails } = req.body;

    try {
        const response = await orderService.placeOrder(productId, clientDetails);
        return res.status(200).json(response)

    } catch (error) {
        // Handle the error based on its type or properties
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (not tested)
export const cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const response = await orderService.cancelOrder(orderId);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const orderConfirmation = async (req, res) => {
    const { orderId } = req.params;
    try {
        const response = await orderService.orderConfirmation(orderId);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
