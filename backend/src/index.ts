import './env';

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import apiRoutes from './routes/api';
import { DbService } from './services/db.service';
import { PatternService } from './services/pattern.service';

const app = express();
const server = http.createServer(app);

const isAllowedOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true);
  if (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin === process.env.CLIENT_URL ||
    origin === process.env.SOCKET_CORS_ORIGIN
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

const io = new Server(server, {
  cors: {
    origin: isAllowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

const dbService = new DbService();
const patternService = new PatternService(dbService);

app.set('io', io); // Inject for routes to use

app.use(cors({
  origin: isAllowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Main API routes
app.use('/api', apiRoutes);

// Health check — required for Railway/Render/Cloud deployment
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'trace'
  });
});

// Root redirect to frontend
app.get('/', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(clientUrl);
});

io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO', socket.id);

  socket.on('request_status', async () => {
    const settings = await dbService.getObservationSettings();
    socket.emit('observation_status', { active: settings.active, sessionId: dbService.getActiveWorkflowId() });
  });

  socket.on('new_event', async (event) => {
    const activeWorkflowId = dbService.getActiveWorkflowId();
    if (activeWorkflowId) {
      event.workflowId = activeWorkflowId;
      event.sessionId = activeWorkflowId; // Ensure sessionId is properly set
      await dbService.saveEvents([event]);
      // Broadcast to frontend
      io.emit('new_event', event);

      // Feature 1: Real-time Live pattern detection broadcast
      try {
        const pattern = await patternService.detectPattern(activeWorkflowId);
        if (pattern && pattern.repeatedActions.length > 0) {
          io.emit('live_pattern', pattern);
        }
      } catch (err) {
        console.error('Failed to run live pattern detection', err);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`TRACE backend running on port ${PORT} (0.0.0.0)`);
});
