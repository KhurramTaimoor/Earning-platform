import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import paymentRoutes from './routes/payments.js';
import taskRoutes from './routes/tasks.js';
import withdrawalRoutes from './routes/withdrawals.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import paymentSettingsRoutes from './routes/paymentSettings.js';
import { fail } from './utils/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    name: 'BMS EarnHub API',
    status: 'running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BMS EarnHub API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use((req, res) => {
  return fail(res, 404, 'Route not found');
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.message && err.message.includes('CORS blocked')) {
    return fail(res, 403, err.message);
  }

  return fail(res, 500, err.message || 'Server error');
});

app.listen(PORT, () => {
  console.log(`BMS EarnHub API running on port ${PORT}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(', ')}`);
});