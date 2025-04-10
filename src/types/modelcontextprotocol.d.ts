declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export class McpServer {
    constructor(options: { name: string; version: string });
    tool(name: string, description: string, schema: any, handler: Function): Promise<void>;
    connect(transport: any): Promise<void>;
    close(): void;
  }
}

declare module '@modelcontextprotocol/sdk/server/sse.js' {
  import { Request, Response } from 'express';
  
  export class SSEServerTransport {
    sessionId: string;
    constructor(messagePath: string, res: Response);
    handlePostMessage(req: Request, res: Response): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/index.js' {
  export class Client {
    constructor(info: { name: string; version: string }, capabilities: any);
    connect(transport: any, options?: { timeout?: number }): Promise<void>;
    listTools(params?: any, options?: { timeout?: number }): Promise<{ tools: Array<{ name: string; description?: string; inputSchema: any }> }>;
    callTool(params: { name: string; arguments: Record<string, unknown> }): Promise<any>;
  }
}

declare module '@modelcontextprotocol/sdk/client/sse.js' {
  export class SSEClientTransport {
    constructor(url: URL);
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio.js' {
  export class StdioClientTransport {
    constructor(options: { command: string; args: string[]; env?: Record<string, string> });
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export interface CallToolResult {
    status: string;
    result?: any;
    error?: string;
  }
} 