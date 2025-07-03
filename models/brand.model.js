const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brand_name: {
    type: String,
    required: true
  },
  isActive:{
    type:Boolean,
    default:true
  }
});

module.exports = mongoose.model('Brand', brandSchema);
