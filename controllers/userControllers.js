const Users = require("../models/userModel")

exports.getUsers = async (req, res) => {
    try {
        const users = new Users()
        // const showData = users.fetchUsers()
        // const hasData = users.keys(req.body).length > 0;
        // if (!hasData) {
        //     return res.status(400).json({ error: "No data provided." });
        // }
        // users.fetchUsers()
        const showData = await Users.fetchUsers()
        return res.status(200).json({ message: "User retrieved successfully.", data: showData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error while getting User." });
    }
}

exports.getUsersById = async (req, res) => {
    try {
        const showData = await Users.fetchUsers()
        const { id } = req.params
        const userId = Object.keys(showData).length > 0
        const filterData = showData.filter(data => data.id == id)
        if (!userId) {
            return res.status(400).json({ error: "No data provided." });
        }
        return res.status(200).json({ message: "User retrieved successfully.", data: filterData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error while getting User." });
    }
}