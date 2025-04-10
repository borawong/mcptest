import { useState } from 'react'
import { Server } from '@/types'
import { ChevronDown, ChevronRight, Edit, Trash, Tool } from '@/components/icons/LucideIcons'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DeleteDialog from '@/components/ui/DeleteDialog'

interface ServerCardProps {
  server: Server
  onRemove: (serverName: string) => void
  onEdit: (server: Server) => void
}

const ServerCard = ({ server, onRemove, onEdit }: ServerCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(server)
  }

  const handleConfirmDelete = () => {
    onRemove(server.name)
    setShowDeleteDialog(false)
  }

  // 计算创建时间
  const createdTimeString = server.createTime 
    ? new Date(server.createTime).toLocaleString() 
    : 'Unknown'

  // 计算在线时间
  const getUptime = () => {
    if (!server.createTime) return 'Unknown'
    const diff = Date.now() - server.createTime
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  return (
    <div className="bg-card-bg border border-border rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Tool size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-text-primary">{server.name}</h2>
            <div className="flex items-center mt-1 space-x-2">
              <Badge status={server.status} />
              <span className="text-xs text-text-secondary">Uptime: {getUptime()}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEdit}
            icon={<Edit size={16} />}
            aria-label="Edit server"
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            icon={<Trash size={16} />}
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Delete server"
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            className="text-text-muted"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        serverName={server.name}
      />

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border mt-2 slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-background/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-text-secondary mb-1">Created</h3>
              <p className="text-sm text-text-primary">{createdTimeString}</p>
            </div>
            <div className="bg-background/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-text-secondary mb-1">Tools</h3>
              <p className="text-sm text-text-primary">{server.tools?.length || 0} Available</p>
            </div>
          </div>
          
          {server.tools && server.tools.length > 0 ? (
            <div className="space-y-3 mt-4">
              <h3 className="text-md font-medium text-text-primary">Available Tools</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {server.tools.map((tool, index) => (
                  <div key={index} className="bg-background/50 p-3 rounded-md border border-border">
                    <h4 className="text-sm font-medium text-text-primary">{tool.name}</h4>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-text-muted py-4">No tools available</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ServerCard