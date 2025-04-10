import { useState, useEffect } from 'react'
import { Server, ApiResponse } from './types'
import ServerCard from './components/ServerCard'
import AddServerForm from './components/AddServerForm'
import EditServerForm from './components/EditServerForm'
import Button from './components/ui/Button'
import { Plus, RefreshCw, Moon, Sun, AlertCircle } from './components/icons/LucideIcons'

function App() {
  const [servers, setServers] = useState<Server[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // 设置主题
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('mcphub-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/servers')
        const data = await response.json()
        
        // 处理API响应中的包装对象，提取data字段
        if (data && data.success && Array.isArray(data.data)) {
          setServers(data.data)
        } else if (data && Array.isArray(data)) {
          // 兼容性处理，如果API直接返回数组
          setServers(data)
        } else {
          // 如果数据格式不符合预期，设置为空数组
          console.error('Invalid server data format:', data)
          setServers([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchServers()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchServers, 5000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1)
  }

  const handleServerAdd = () => {
    setRefreshKey(prevKey => prevKey + 1)
  }

  const handleServerEdit = (server: Server) => {
    // Fetch settings to get the full server config before editing
    fetch(`/api/settings`)
      .then(response => response.json())
      .then((settingsData: ApiResponse<{ mcpServers: Record<string, any> }>) => {
        if (
          settingsData &&
          settingsData.success &&
          settingsData.data &&
          settingsData.data.mcpServers &&
          settingsData.data.mcpServers[server.name]
        ) {
          const serverConfig = settingsData.data.mcpServers[server.name]
          const fullServerData = {
            name: server.name,
            status: server.status,
            tools: server.tools || [],
            config: serverConfig,
            createTime: server.createTime,
          }

          console.log('Editing server with config:', fullServerData)
          setEditingServer(fullServerData)
        } else {
          console.error('Failed to get server config from settings:', settingsData)
          setError(`Could not find configuration data for ${server.name}`)
        }
      })
      .catch(err => {
        console.error('Error fetching server settings:', err)
        setError(err instanceof Error ? err.message : String(err))
      })
  }

  const handleEditComplete = () => {
    setEditingServer(null)
    setRefreshKey(prevKey => prevKey + 1)
  }

  const handleServerRemove = async (serverName: string) => {
    try {
      const response = await fetch(`/api/servers/${serverName}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!response.ok) {
        setError(result.message || `Failed to delete server ${serverName}`)
        return
      }

      setRefreshKey(prevKey => prevKey + 1)
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card-bg border border-border shadow rounded-lg p-6 flex flex-col items-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-medium text-text-primary mb-2">Error</h2>
            <p className="text-text-secondary text-center mb-6">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="primary"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">MCP Hub Dashboard</h1>
            <button 
              onClick={toggleTheme} 
              className="ml-4 p-2 rounded-full hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              icon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <AddServerForm onAdd={handleServerAdd} />
          </div>
        </header>
        
        <div className="space-y-4">
          {servers.length === 0 ? (
            <div className="bg-card-bg border border-border rounded-lg p-8 text-center">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <RefreshCw size={36} className="text-text-primary animate-spin mb-4" />
                  <p className="text-text-secondary">Loading servers...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-text-secondary mb-4">No MCP servers available</p>
                  <Button 
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => document.getElementById('add-server-button')?.click()}
                  >
                    Add Server
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 fade-in">
              {servers.map((server, index) => (
                <ServerCard
                  key={index}
                  server={server}
                  onRemove={handleServerRemove}
                  onEdit={handleServerEdit}
                />
              ))}
            </div>
          )}
        </div>
        
        {editingServer && (
          <EditServerForm
            server={editingServer}
            onEdit={handleEditComplete}
            onCancel={() => setEditingServer(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App