const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections')
const candidateRoutes = require('./routes/candidates');

require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// server Test
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);

// Wellcome page 
app.get('/', (req, res) => {
    res.json({message: 'سلام, API سیستم رای گیری فعال است'});
});

// server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`سرور روی پورت ${PORT} اجرا شد`);
});