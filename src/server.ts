import express from 'express';
import config from './config/index.js';
import { initMcpServer, registerAllTools } from './services/mcpService.js';
import { initMiddlewares } from './middlewares/index.js';
import { initRoutes } from './routes/index.js';
import { handleSseConnection, handleSseMessage } from './services/sseService.js';
import fs from 'fs';
import path from 'path';

export class AppServer {
  private app: express.Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = config.port;
  }

  async initialize(): Promise<void> {
    try {
      // 确保配置文件存在
      this.ensureConfigExists();
      
      const mcpServer = await initMcpServer(config.mcpHubName, config.mcpHubVersion);
      await registerAllTools(mcpServer, true);
      initMiddlewares(this.app);
      initRoutes(this.app);
      
      // SSE路由 - 添加特定的Cursor兼容性
      this.app.get('/sse', (req, res) => {
        // 针对Cursor客户端的特殊处理
        const userAgent = req.headers['user-agent'] || '';
        if (userAgent.includes('Cursor')) {
          console.log('Cursor client detected, applying special headers');
        }
        handleSseConnection(req, res);
      });
      
      this.app.post('/messages', handleSseMessage);
      console.log('Server initialized successfully');
    } catch (error) {
      console.error('Error initializing server:', error);
      throw error;
    }
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
      console.log(`Dashboard available at: http://localhost:${this.port}`);
      console.log(`SSE endpoint available at: http://localhost:${this.port}/sse`);
    });
  }

  getApp(): express.Application {
    return this.app;
  }
  
  private ensureConfigExists(): void {
    const settingsPath = path.resolve(process.cwd(), 'mcp_settings.json');
    const examplePath = path.resolve(process.cwd(), 'mcp_settings.json.example');
    
    // 如果配置文件不存在
    if (!fs.existsSync(settingsPath)) {
      console.log('Creating default mcp_settings.json');
      
      // 尝试从示例文件复制
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, settingsPath);
      } else {
        // 如果示例文件也不存在，创建一个空的配置
        fs.writeFileSync(settingsPath, JSON.stringify({ mcpServers: {} }, null, 2));
      }
    }
  }
}

export default AppServer;
