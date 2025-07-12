const Subcategory = require("../models/subcategory.model")
exports.getSubcategory = async (req, res) => {
    const subcategoies = await Subcategory.find()
    if (!subcategoies) {
        return res.status(404).json({ error: "Subcategories not found." });
    }

    return res.status(200).json({ message: "Subcategory found successfully.", subcategoies });
}
exports.getSubcategoryById = async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(404).json({ error: "Brand not found. Please provide a title." });
    }
    const subcategoryId = await Subcategory.findById(id)
    return res.status(200).json({ message: "Brand found successfully.", subcategoryId });
}
exports.addSubcategory = async (req, res) => {
    const { subcategory_name, isActive } = req.body;
    if (!subcategory_name) {
        return res.status(400).json({ error: "subcategory_name and subcategory_data are required." });
    }
    const newSubcategory = await Subcategory.create({
        subcategory_name, isActive

    })

    return res.status(201).json({ message: "Subcategory created successfully.", data: newSubcategory });
}
exports.updateSubcategory = async (req, res) => {
    const { categoryId, title } = req.body;
    const { id } = req.params.id
    if (!categoryId, !title) {
        return res.status(400).json({ error: "Title is required to update the Subcategory." });
    }

    return res.status(200).json({ message: `Subcategory with ID ${id} updated successfully.` });
}
exports.deleteSubcategory = async (req, res) => {
    const { isActive } = req.body;
    const { id } = req.params.id
    if (isActive === false) {
        return res.status(200).json({ message: `Subcategory with ID ${id} is now inactive (soft deleted).` });
    } else if (isActive === true) {
        return res.status(200).json({ message: `Subcategory with ID ${id} is now active.` });
    } else {
        return res.status(400).json({ error: "isActive field is required and must be true or false." });
    }
}