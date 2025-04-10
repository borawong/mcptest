import { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { getMcpServer } from './mcpService.js';

const transports: { [sessionId: string]: SSEServerTransport } = {};

/**
 * 处理SSE连接请求
 * 支持多种客户端，包括Cursor、CherryStudio和其他MCP客户端
 */
export const handleSseConnection = async (req: Request, res: Response): Promise<void> => {
  const userAgent = req.headers['user-agent'] || '';
  const isCursor = userAgent.includes('Cursor');
  
  // 设置SSE特定的头部
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 防止Nginx缓冲
  
  // CORS头部，确保跨域请求可以工作
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Cursor特定的处理
  if (isCursor) {
    console.log('Cursor client detected, applying special handling');
    // Cursor可能需要额外的头部或特殊处理
    res.setHeader('X-Cursor-Compatible', 'true');
  }
  
  // 立即发送初始数据保持连接活跃
  res.write(':\n\n');
  
  try {
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    
    // 设置心跳，每15秒发送一个注释保持连接活跃
    // Cursor可能需要更频繁的心跳
    const heartbeatInterval = isCursor ? 10000 : 30000;
    const heartbeat = setInterval(() => {
      if (res.writableEnded) {
        clearInterval(heartbeat);
        return;
      }
      res.write(':\n\n');
    }, heartbeatInterval);
    
    res.on('close', () => {
      clearInterval(heartbeat);
      delete transports[transport.sessionId];
      console.log(`SSE connection closed: ${transport.sessionId}`);
    });
    
    console.log(`New SSE connection established: ${transport.sessionId}`);
    await getMcpServer().connect(transport);
  } catch (error) {
    console.error('Error establishing SSE connection:', error);
    // 尝试优雅地处理错误，确保客户端收到错误通知
    if (!res.writableEnded) {
      res.write(`event: error\ndata: ${JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) 
      })}\n\n`);
      res.end();
    }
  }
};

/**
 * 处理SSE消息请求
 */
export const handleSseMessage = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.query.sessionId as string;
  
  if (!sessionId) {
    console.error('No sessionId provided in request');
    res.status(400).json({
      success: false,
      message: 'No sessionId provided in request'
    });
    return;
  }
  
  const transport = transports[sessionId];

  if (transport) {
    try {
      await transport.handlePostMessage(req, res);
    } catch (error) {
      console.error(`Error handling message for session ${sessionId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    console.error(`No transport found for sessionId: ${sessionId}`);
    res.status(400).json({
      success: false,
      message: 'No transport found for sessionId'
    });
  }
};

/**
 * 获取当前连接数
 */
export const getConnectionCount = (): number => {
  return Object.keys(transports).length;
};

/**
 * 关闭所有连接
 */
export const closeAllConnections = (): void => {
  Object.keys(transports).forEach(sessionId => {
    try {
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing connection ${sessionId}:`, error);
    }
  });
  console.log('All SSE connections closed');
};
