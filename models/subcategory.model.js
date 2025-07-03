const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  subcategory_name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
// subcategory_name