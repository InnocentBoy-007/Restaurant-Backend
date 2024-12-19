import ProductModel from "../../model/productModel.js";

// This is accessible both by admin and client without any kind authentication
export const fetchProducts = async (req, res) => {
    try {
        const products = await ProductModel.find();
        if (!products) return res.status(500).json({ message: "Products cannot be fetch from database! - backend" });
        if (products.length === 0) return res.status(404).json({ message: "There are no products in the database! - backend" });
        return res.status(200).json({ products });
    } catch (error) {
        console.error("Error while fetching products in product control --->", error);
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch products from the database! - backend" });
    }
}
