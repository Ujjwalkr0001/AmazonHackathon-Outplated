const express = require('express');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');

const app = express();
app.use(express.json());

// Exposing API without rate limiting or helmet security headers
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
