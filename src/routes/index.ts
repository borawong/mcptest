import express from 'express';
import {
  getAllServers,
  getAllSettings,
  createServer,
  updateServer,
  deleteServer,
} from '../controllers/serverController.js';
import { getConnectionCount } from '../services/sseService.js';

const router = express.Router();

export const initRoutes = (app: express.Application): void => {
  router.get('/servers', getAllServers);
  router.get('/settings', getAllSettings);
  router.post('/servers', createServer);
  router.put('/servers/:name', updateServer);
  router.delete('/servers/:name', deleteServer);

  // 添加健康检查端点
  router.get('/health', (_, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      connections: getConnectionCount(),
    });
  });

  app.use('/api', router);
};

export default router;
