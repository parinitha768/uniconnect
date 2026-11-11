import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import facultyRoutes from './routes/facultyRoutes';
import parentRoutes from './routes/parentRoutes';
import adminRoutes from './routes/adminRoutes';
import examRoutes from './routes/examRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'UniConnect University Management Portal API',
    university: 'Nagarjuna University',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/examinations', examRoutes);
app.use('/api/notifications', notificationRoutes);

// Static frontend serving in production
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist'),
];

const finalDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (finalDistPath) {
  console.log(`📦 Serving production frontend build from: ${finalDistPath}`);
  app.use(express.static(finalDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(finalDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 UniConnect Backend API Server running on port ${PORT}`);
  console.log(`🏛️ Nagarjuna University Centralized Management System`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});

export default app;

