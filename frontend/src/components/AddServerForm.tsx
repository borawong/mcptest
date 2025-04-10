import { useState } from 'react'
import ServerForm from './ServerForm'
import Button from './ui/Button'
import { Plus } from './icons/LucideIcons'

interface AddServerFormProps {
  onAdd: () => void
}

const AddServerForm = ({ onAdd }: AddServerFormProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const openForm = () => setIsOpen(true)
  const closeForm = () => setIsOpen(false)

  const handleSubmitSuccess = () => {
    closeForm()
    onAdd()
  }

  return (
    <>
      <Button
        id="add-server-button"
        variant="primary"
        size="sm"
        icon={<Plus size={16} />}
        onClick={openForm}
        className="whitespace-nowrap"
      >
        Add Server
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-border rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-in">
            <h2 className="text-xl font-medium text-text-primary mb-6">Add a New MCP Server</h2>
            <ServerForm 
              initialValues={{
                name: '',
                command: 'npx',
                args: [],
                env: {},
              }}
              onSubmit={handleSubmitSuccess}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default AddServerForm