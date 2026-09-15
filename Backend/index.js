const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const healthRoutes = require('./routes/health.routes');
const farmRoutes = require('./routes/farm.routes');
const truckRoutes = require('./routes/truck.routes');
const warehouseRoutes = require('./routes/warehouse.routes');
const roadRoutes = require('./routes/road.routes');
const urgencyRoutes = require('./routes/urgency.routes');
const processEngineRoutes = require('./routes/processEngine.routes');
const transportPlanRoutes = require('./routes/transportPlan.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
// app.use('/api/farm', farmRoutes);
// app.use('/api/truck', truckRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/roads', roadRoutes);
app.use('/api/urgency', urgencyRoutes);
app.use('/api/process', processEngineRoutes);
app.use('/api/transport-plans', transportPlanRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
