const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// server Test
testConnection();

// Routes
app.use('/api/auth', authRoutes);

// Wellcome page 
app.get('/', (req, res) => {
    res.json({message: 'سلام, API سیستم رای گیری فعال است'});
});

// server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`سرور روی پورت ${PORT} اجرا شد`);
});