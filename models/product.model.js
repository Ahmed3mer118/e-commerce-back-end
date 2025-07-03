const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_title: {
        type: String,
        required: true,
    },
    product_image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    product_description: {
        type: String,
        required: true,
    },
    category_name: {
        type: String,
        enum: ['men', 'Women'],
        default:'men'
    },
    stock: {
        type: Number,
        default: 1,
        required:true
    },
    minStock: {
        type: Number,
        default : 5,
        required:true
      },
    isActive: {
        type: Boolean,
        default: true,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        // required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
    }

}, {
    timeseries: true
});

module.exports = mongoose.model('Product', productSchema);
