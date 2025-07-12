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
      const id = req.user;
      const user = await Users.findById(id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      return res.status(200).json({
        message: "User retrieved successfully.",
        data: user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Server error while getting user.",
      });
    }
  };
  