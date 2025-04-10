#!/bin/bash
set -e

# 设置NPM源
NPM_REGISTRY=${NPM_REGISTRY:-https://registry.npmjs.org/}
echo "Setting npm registry to ${NPM_REGISTRY}"
npm config set registry "$NPM_REGISTRY"

# 设置请求超时
echo "Using REQUEST_TIMEOUT: $REQUEST_TIMEOUT"

# 确保MCP设置文件存在
if [ ! -f "/app/mcp_settings.json" ]; then
  echo "mcp_settings.json not found, creating default configuration"
  cp /app/mcp_settings.json.example /app/mcp_settings.json 2>/dev/null || echo '{"mcpServers":{}}' > /app/mcp_settings.json
fi

# 添加额外的MCP服务检查
echo "Verifying MCP services..."
pnpm list | grep -i "mcp" || echo "No MCP services installed globally"

# 打印一些调试信息
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PNPM version: $(pnpm -v)"

# 执行传递的命令
exec "$@"
