import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import logger from '#src/config/logger.js';

const PORT = Number(process.env.PORT) || 4000;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 3. Room Management
io.on('connection', (socket) => {
  const { projectId } = socket.handshake.query;

  logger.info(`[Socket] New connection attempt: ${socket.id}`);

  if (projectId) {
    const projectIds = typeof projectId === 'string' ? projectId.split(',') : [projectId];
    projectIds.forEach((id) => {
      const room = `project_${id}`;
      socket.join(room);
      logger.info(`[Socket] Client ${socket.id} successfully joined room: ${room}`);
    });

    // Debug: Check room membership
    const rooms = Array.from(socket.rooms);
    logger.info(`[Socket] Current rooms for ${socket.id}: ${rooms.join(', ')}`);
  } else {
    logger.warn(`[Socket] Connection ${socket.id} missing projectId in query params`);
  }

  socket.on('disconnect', (reason) => {
    logger.info(`[Socket] Client ${socket.id} disconnected. Reason: ${reason}`);
  });
});


// 4. Attach io to app for use in controllers/services
app.set('io', io);

// 5. Start Server
server.listen(PORT, () => {
  console.log(`[server]: Server is running on http://localhost:${PORT}`);
});
