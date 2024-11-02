import Product from '../model/productModel.js'

class AdminControl {
    async addProduct(productDetails) {
        if(!productDetails) {
            throw new Error("Product details are necessary!");
        }

        const productAddedOn = new Date().toLocaleString();

        const addProductResponse = await Product.create({
            productName:productDetails.productName,
            productPrice:productDetails.productPrice,
            productQuantity:productDetails.productQuantity,
            productAddedOn:productAddedOn
        })

        return {
            message:"Product added successfully! - backend",
            addProductResponse
        }
    }
}

export const addProduct = async(req, res) => {
    const {productDetails} = req.body;
    const adminControl = new AdminControl();
    try {
        const response = await adminControl.addProduct(productDetails);
        return res.status(201).json(response)
    } catch (error) {
        res.status(error.errorCode || 500).json({
            error: error.message || "Internal server error! - backend"
        })
    }
}
