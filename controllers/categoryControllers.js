
exports.getCategories = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(404).json({ error: "Category not found. Please provide a title." });
    }

    return res.status(200).json({ message: "Category found successfully." });
}
exports.addCategory = async (req, res) => {
    const {subcategoryId, title ,isActive } = req.body;

    if (!subcategoryId || !title || isActive === undefined) {
        return res.status(400).json({ error: "Title and isActive are required." });
    }

    return res.status(201).json({ message: "Category created successfully." });
}
exports.updateCategory = async (req, res) => {
    const {subcategoryId, title  } = req.body;
    const { id } = req.params.id
    if (!subcategoryId ||!title) {
        return res.status(400).json({ error: "Title is required to update the Category." });
    }

    return res.status(200).json({ message: `Category with ID ${id} updated successfully.` });
}

exports.deleteCategory = async (req, res) => {
    const { isActive } = req.body;
    const { id } = req.params.id

    if (isActive === false) {
        return res.status(200).json({ message: `Category with ID ${id} is now inactive (soft deleted).` });
    } else if (isActive === true) {
        return res.status(200).json({ message: `Category with ID ${id} is now active.` });
    } else {
        return res.status(400).json({ error: "isActive field is required and must be true or false." });
    }
}