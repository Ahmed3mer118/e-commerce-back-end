const Brand = require("../models/brand.model")

exports.getBrand = async (req, res) => {
    const brand = await Brand.find()
    if (!brand) {
        return res.status(404).json({ error: "Brand not found. Please provide a title." });
    }

    return res.status(200).json({ message: "Brand found successfully.", brand });
}
exports.getBrandById = async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(404).json({ error: "Brand not found. Please provide a title." });
    }
    const brandId = await Brand.findById(id)
    return res.status(200).json({ message: "Brand found successfully.", brandId });

}
exports.addBrand = async (req, res) => {
    const { brand_name, isActive } = req.body;

    if (!brand_name) {
        return res.status(400).json({ error: "Brand_name is required." });
    }
    const newBrand = await Brand.create({ brand_name, isActive })

    return res.status(201).json({ message: "Brand created successfully.", data: newBrand });
}
exports.updateBrand = async (req, res) => {
    const { brand_name } = req.body;
    const { id } = req.params.id
    if (!title) {
        return res.status(400).json({ error: "Title is required to update the brand." });
    }

    return res.status(200).json({ message: `Brand with ID ${id} updated successfully.` });
}

exports.deleteBrand = async (req, res) => {
    const { isActive } = req.body;
    const { id } = req.params.id

    if (isActive === false) {
        return res.status(200).json({ message: `Brand with ID ${id} is now inactive (soft deleted).` });
    } else if (isActive === true) {
        return res.status(200).json({ message: `Brand with ID ${id} is now active.` });
    } else {
        return res.status(400).json({ error: "isActive field is required and must be true or false." });
    }
}