import { FolderOpen, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

interface FileTreeProps {
  files: FileNode[]
  onSelectFile?: (path: string) => void
}

const FileTreeNode = ({ 
  node, 
  depth = 0, 
  path = '', 
  onSelectFile 
}: { 
  node: FileNode
  depth?: number
  path?: string
  onSelectFile?: (path: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const fullPath = `${path}/${node.name}`

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen)
    } else if (onSelectFile) {
      onSelectFile(fullPath)
    }
  }

  return (
    <div>
      <motion.div
        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={handleClick}
        whileHover={{ x: 2 }}
      >
        {node.type === 'directory' ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <FolderOpen className="w-4 h-4 text-yellow-500" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileText className="w-4 h-4 text-blue-500" />
          </>
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
      </motion.div>

      <AnimatePresence>
        {isOpen && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {node.children.map((child, index) => (
              <FileTreeNode
                key={index}
                node={child}
                depth={depth + 1}
                path={fullPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FileTree = ({ files, onSelectFile }: FileTreeProps) => {
  return (
    <div className="p-2">
      {files.map((file, index) => (
        <FileTreeNode key={index} node={file} onSelectFile={onSelectFile} />
      ))}
    </div>
  )
}

export default FileTree