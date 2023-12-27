const express = require('express');
const cors = require('cors');

const assetRoutes = require('./src/routes/assetRoutes');
const readingRoutes = require('./src/routes/readingRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const app = express();
const PORT = process.env.PORT || 3000; // Define the port

app.use(cors());
app.use(express.json());
app.use('/assets', assetRoutes);
app.use('/readings', readingRoutes);
app.use('/services', serviceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
