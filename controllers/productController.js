// productController.js

const Product = require('../models/product'); // Assuming the model is stored in models/productModel.js

exports.batchCreateProducts = async (req, res, next) => {
    try {
        const products = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Data should be an array of products' });
        }

        // Use insertMany for batch insertion
        const createdProducts = await Product.insertMany(products);

        res.status(201).json({
            success: true,
            message: `${createdProducts.length} products created successfully`,
            data: createdProducts
        });
    } catch (error) {
        console.error('Error creating products:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

// 1. Create a new product
exports.createProduct = async (req, res, next) => {
    console.log(req.body);
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Product creation failed',
            error: error.message
        });
    }
};

// 2. Update an existing product
exports.updateProduct = async (req, res, next) => {
    const { name, slug, description, price, category, stock, images } = req.body; // Destructure the data from the request body
    const productId = req.params.id; // Get the product ID from the URL parameters
    console.log(price);
    try {
        // Find the product by the provided ID
        let product = await Product.findById(productId);

        // Check if the product exists
        if (product) {
            // Update product information if provided
            if (name) {
                product.name = name;
            }
            if (slug) {
                product.slug = slug;
            }
            if (description) {
                product.description = description;
            }
            if (price) {
                product.price = price;
            }
            if (category) {
                product.category = category;
            }
            if (stock !== undefined) {
                product.stock = stock;
            }
            if (images) {
                product.images = images;
            }

            // Save the updated product to the database
            await product.save();

            // Respond with the updated product data
            return res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } else {
            // If product doesn't exist, respond with an error
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        // Handle any errors during the update process
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// 3. Delete a product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Product deletion failed',
            error: error.message
        });
    }
};

// 4. Get a single product by ID
exports.getProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'why run on this',
            error: error.message
        });
    }
};

// 5. Get all products with optional filtering, sorting, and pagination
exports.getAllProducts = async (req, res) => {
    try {
        // Filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        // Advanced filtering for price range, etc.
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execute query
        const products = await query;

        res.status(200).json({
            success: true,
            results: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve products',
            error: error.message
        });
    }
};

exports.searchProducts = async (req, res, next) => {
    const { name, category, minPrice, maxPrice, inStock, fromDate, toDate } = req.query; // Extract query parameters

    const query = {};

    // Add search criteria based on query parameters
    if (name) {
        query.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search by name
    }

    if (category) {
        query.category = category; // Filter by category
    }

    if (minPrice && maxPrice) {
        query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }; // Filter by price range
    } else if (minPrice) {
        query.price = { $gte: parseFloat(minPrice) }; // Filter by minimum price
    } else if (maxPrice) {
        query.price = { $lte: parseFloat(maxPrice) }; // Filter by maximum price
    }

    if (inStock === 'true') {
        query.stock = { $gt: 0 }; // Filter by products that are in stock
    }

    if (fromDate && toDate) {
        query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) }; // Filter by creation date range
    } else if (fromDate) {
        query.createdAt = { $gte: new Date(fromDate) }; // Filter by products created from a specific date
    } else if (toDate) {
        query.createdAt = { $lte: new Date(toDate) }; // Filter by products created until a specific date
    }

    try {
        // Execute the query to find products matching the criteria
        const products = await Product.find(query);

        // Check if any products match the search query
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found'
            });
        }

        // Respond with the found products
        res.status(200).json({
            success: true,
            message: `${products.length} products found`,
            data: products
        });
    } catch (error) {
        // Handle any errors during the search process
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


