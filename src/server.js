'use strict';

require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { health } = require('./controllers/auth.controller');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

// Root health check for load balancers and local checks.
app.get('/health', health);

// Routes
app.use('/api/authn', authRoutes);

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Only start the server when this file is run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`authn service listening on port ${PORT}`);
  });
}

module.exports = app;
