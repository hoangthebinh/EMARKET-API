const express = require('express');
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getAllProducts,
    batchCreateProducts,
    searchProducts
} = require('../controllers/productController');

const router = express.Router();

// Routes
router.route('/').get(getAllProducts);
router.route('/create').post(createProduct)
router.route('/product/:id').get(getProduct).put(updateProduct).delete(deleteProduct);
router.post('/import', batchCreateProducts);
router.route('/search').get(searchProducts);

module.exports = router;