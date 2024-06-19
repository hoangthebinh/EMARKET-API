const express = require('express');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const authMiddleware = require('./middleware/authMiddleware');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoute');
const productRoutes = require('./routes/productRoute');

// Load config
dotenv.config({ path: './config/config.env' });

const app = express();

// Middleware để phân tích dữ liệu JSON từ các yêu cầu
app.use(bodyParser.json());

// Kết nối tới cơ sở dữ liệu
connectDatabase();

// Định nghĩa route đơn giản
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/products', productRoutes);

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });
app.listen(PORT, '10.228.101.134', () => {
    console.log('server started');
})