const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

app.use(express.json());

// Define Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/'));

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
