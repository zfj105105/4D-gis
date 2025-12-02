import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import markerRoutes from './routes/markers';
import markerTypeRoutes from './routes/markerTypes';
import friendRoutes from './routes/friends';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/markers', markerRoutes);
app.use('/marker-types', markerTypeRoutes);
app.use('/friends', friendRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || '服务器发生未知错误'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

