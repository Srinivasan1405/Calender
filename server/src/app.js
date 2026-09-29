const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const goalRoutes = require('./routes/goals');
const performanceRoutes = require('./routes/performance');
const gamificationRoutes = require('./routes/gamification');
const focusRoutes = require('./routes/focus');
const insightsRoutes = require('./routes/insights');
const categoryRoutes = require('./routes/categories');
const exportRoutes = require('./routes/export');
const eventsRoutes = require('./routes/events');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Cache the connection on globalThis so warm serverless invocations reuse it
// instead of opening a new pool per request.
let cache = globalThis.__mongoConnect;
if (!cache) {
  cache = globalThis.__mongoConnect = { conn: null, promise: null };
}

function connectDB() {
  if (cache.conn) return Promise.resolve(cache.conn);

  if (!cache.promise) {
    if (!process.env.MONGO_URI) {
      return Promise.reject(new Error('MONGO_URI is not set'));
    }
    mongoose.set('strictQuery', true);
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, { bufferCommands: true })
      .then((m) => m.connection);
  }

  return cache.promise
    .then((conn) => {
      cache.conn = conn;
      return conn;
    })
    .catch((err) => {
      cache.promise = null;
      throw err;
    });
}

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  res.json({
    message: 'RoutineRise API is running',
    version: '2.0',
    database: states[mongoose.connection.readyState] || 'unknown',
    missingEnv: missing,
  });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    res.status(503).json({ msg: 'Database unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/chat', chatRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ msg: 'Endpoint not found' });
});

// On Vercel the React bundle is served by the static build, not by Express.
if (!process.env.VERCEL) {
  const clientBuild = path.join(__dirname, '../../client/build');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

module.exports = app;
module.exports.connectDB = connectDB;
