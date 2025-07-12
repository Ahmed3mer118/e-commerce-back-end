const Product = require("../models/product.model");
const slugify = require('slugify');
const logger = require("../utils/logger.util")
const {sendEmailToAdmin} = require("../utils/sendEmail")
const Cart = require('../models/cart.model');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('subcategory brand', "subcategory_name brand_name -_id")
        logger.info(`Admin retrieved all products`)

        return res.status(200).json({ message: "Products retrieved successfully.", data: products });
    } catch (error) {
        logger.error(`Admin failed to retrieve all products error :${error} ; data :${req.body}`)
        return res.status(500).json({ error: "Server error while getting products." });
    }
}

exports.getProductsbyId = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ error: "No data provided." });
        }
        const productId = await Product.findById(id)
        return res.status(200).json({ data: productId });
    } catch (error) {
        logger.error(`Admin failed to retrieve  product error :${error} ; data :${req.body}`)
        return res.status(500).json({ error: "Server error while getting products." });
    }
}
exports.getProductsbyRouteProduct = async (req, res) => {
    try {
        const { routeProduct } = req.params

        if (!routeProduct) {
            return res.status(400).json({ error: "No data provided." });
        }
        const productByRouteProduct = await Product.findOne({ routeProduct });
        return res.status(200).json({ data: productByRouteProduct });
    } catch (error) {
        logger.error(`Admin failed to retrieve  product error :${error} ; data :${req.body}`)
        return res.status(500).json({ error: "Server error while getting products." });
    }
}

exports.addProduct = async (req, res) => {
    try {
        const {
            product_title,
            price,
            product_description,
            stock,
            minStock,
            category_name,
            isActive,
            subcategory,
            brand
        } = req.body;

        const image = req.file?.filename;
        if (!image) {
            return res.status(400).json({ error: "Product image is required." });
        }
        let baseSlug = slugify(product_title, { lower: true, strict: true });

        let uniqueSlug = baseSlug;
        let count = 1;
        while (await Product.findOne({ routeProduct: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${count++}`;
        }
        const newProduct = await Product.create({
            product_title,
            product_image: image,
            price,
            product_description,
            stock,
            minStock,
            category_name,
            isActive,
            subcategory,
            brand,
            routeProduct: uniqueSlug,
        });
        // logger.info(`Admin created a new product with id ${newProduct._id}`);
        // if (newProduct.stock <= newProduct.minStock) {
        //     logger.warn(`Stock for product ${newProduct._id} is low. Current stock: ${newProduct.stock}`);
        // }
        return res.status(201).json({
            message: "Product created successfully",
            product: newProduct,
        });

    } catch (error) {
        logger.error("Admin failed to create new product", {
            error: error.message,
            stack: error.stack,
            data: req.body
        });
        return res.status(500).json({ error: "Server error while creating product." });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_title,
            price,
            product_description,
            stock,
            minStock,
            category_name,
            isActive,
            subcategory,
            brand,
        } = req.body;

        const product_image = req.file?.filename || req.body.product_image;

        if (
            !product_title ||
            !product_image ||
            !price ||
            !product_description ||
            stock == null ||
            minStock == null ||
            !category_name ||
            !subcategory ||
            !brand
        ) {
            return res
                .status(400)
                .json({ error: "All fields are required to update the product." });
        }

        let baseSlug = slugify(product_title, { lower: true, strict: true });
        let uniqueSlug = baseSlug;
        let count = 1;
        while (await Product.findOne({ routeProduct: uniqueSlug, _id: { $ne: id } })) {
            uniqueSlug = `${baseSlug}-${count++}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                product_title,
                product_image,
                price,
                product_description,
                stock,
                minStock,
                category_name,
                isActive,
                subcategory,
                brand,
                routeProduct: uniqueSlug,
            },
            { new: true }
        );
        await Cart.updateMany(
            { productId: id, isPurchased: false },
            [
              {
                $set: {
                  currentPrice: updatedProduct.price,
                  priceChanged: {
                    $cond: [{ $ne: ["$currentPrice", updatedProduct.price] }, true, false]
                  }
                }
              }
            ]
          );
          
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json({
            message: `Product with ID ${id} updated successfully.`,
            product: updatedProduct,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: "Server error while updating product.", details: error.message });
    }
};

exports.updateStatusProduct = async (req, res) => {
    try {
        const { isActive } = req.body;
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const newActive = await Product.findByIdAndUpdate(id, { isActive: !isActive }, { new: true, select: "isActive" });

        if (isActive === false) {
            // logger.info(`Admin delete product with id ${id} Product with ID ${id} is now inactive (soft deleted)`);
            return res.status(200).json({
                // message: `Product with ID ${product.product_title} is now inactive (soft deleted).`,
                message: `Product with ID ${product.product_title} is now active.`,
                isActive: newActive,
            });
        } else if (isActive === true) {
            // logger.info(`Admin delete product with id ${id} Product with ID ${id} is now active.`);
            return res.status(200).json({
                // message: `Product with ID ${product.product_title} is now active.`,
                message: `Product with ID ${product.product_title} is now inactive (soft deleted).`,
                isActive: newActive,
            });
        } else {
            logger.error(`Admin failed to delete product with id ${id} isActive field must be true or false.`);
            return res.status(400).json({ error: "isActive field must be true or false." });
        }
    } catch (error) {
        logger.error("Admin failed to delete product", {
            error: error.message,
            stack: error.stack,
            data: req.body
        });
        return res.status(500).json({ error: "Server error while deleting product." });
    }
}
exports.getMultipleProductsByIds = async (req, res) => {
    try {
      const { ids } = req.body; 
      const products = await Product.find({ _id: { $in: ids } });
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
exports.checkStock = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: { $lte: ["$stock", "$minStock"] }
        });

        console.log('Low stock products:', lowStockProducts);

        if (lowStockProducts.length > 0) {

            const htmlList = lowStockProducts.map(product =>
                `<li>
                    <strong>${product.product_title}</strong>: 
                    ${product.stock} units left (Min: ${product.minStock})
                </li>`
            ).join("\n");


            const message = `
                <p>The following products are at or below minimum stock level:</p>
                <ul>${htmlList}</ul>
                <p>Please take immediate action to restock these items.</p>
            `;

            const mailOptions = {
                to: process.env.EMAIL_ADMIN,
                subject: `🚨 Low Stock Alert - ${lowStockProducts.length} Product(s)`,
                message: message,
                products: lowStockProducts
            };

            await sendEmailToAdmin(mailOptions);

            return res.status(200).json({
                success: true,
                message: "Stock alert sent to admin successfully",
                low_stock_count: lowStockProducts.length,
                products: lowStockProducts.map(p => ({
                    id: p._id,
                    title: p.product_title,
                    stock: p.stock,
                    minStock: p.minStock
                }))
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "All products have sufficient stock",
                low_stock_count: 0
            });
        }
    } catch (error) {
        console.error('Error in checkStock:', error);
        return res.status(500).json({
            success: false,
            error: "Server Error while checking stock",
            details: error.message
        });
    }
};

