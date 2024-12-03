import { useState, useEffect, useContext } from 'react'
import { Terminal, Play, Maximize2, Minimize2, AlertTriangle, Wand2, LayoutPanelLeft, LayoutPanelTop } from 'lucide-react'
import Editor from '@monaco-editor/react'
import FileTree from '../components/FileTree'
import PreviewFrame from '../components/PreviewFrame'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from '../App'
import { generateCode } from '../services/ai'
import { mountFiles, startDevServer, installDependencies, writeFile } from '../services/webcontainer'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

const AurocoderPage = () => {
  const { darkMode } = useContext(ThemeContext)
  const [files] = useLocalStorage<FileNode[]>('project_files', [])
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [maximized, setMaximized] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    // Initialize WebContainer when component mounts
    const init = async () => {
      try {
        setOutput('Initializing development environment...')
        await mountFiles({
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'aurocoder-project',
                type: 'module',
                scripts: {
                  dev: 'vite'
                },
                dependencies: {
                  react: '^18.2.0',
                  'react-dom': '^18.2.0'
                },
                devDependencies: {
                  '@vitejs/plugin-react': '^4.0.0',
                  'vite': '^4.3.9'
                }
              }, null, 2)
            }
          },
          'src': {
            directory: {
              'main.jsx': {
                file: {
                  contents: `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`
                }
              }
            }
          }
        })
        setOutput('Environment initialized successfully!')
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error)
        setError('Failed to initialize development environment')
      }
    }
    init()
  }, [])

  const handleFileSelect = (path: string) => {
    // TODO: Implement file selection logic
    console.log('Selected file:', path)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const handleGenerateCode = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const generatedCode = await generateCode(code)
      setCode(generatedCode)
    } catch (error) {
      setError('Failed to generate code')
      console.error('Code generation error:', error)
    }
    setIsLoading(false)
  }

  const handleRunCode = async () => {
    setIsLoading(true)
    setError(null)
    setOutput('Starting development server...')

    try {
      // Write the current code to App.jsx
      await writeFile('src/App.jsx', code || 'export default function App() { return <div>Hello World</div> }')

      // Install dependencies if needed
      const install = await installDependencies(['vite', '@vitejs/plugin-react'])
      if (!install.success) {
        throw new Error(install.error || 'Failed to install dependencies')
      }

      // Start development server
      const server = await startDevServer()
      if (!server.success) {
        throw new Error(server.error || 'Failed to start server')
      }

      setServerUrl(server.url || null)
      setOutput('Server started successfully!')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to run code')
      console.error('Runtime error:', error)
    }
    setIsLoading(false)
  }

  return (
    <div className={`pt-16 h-screen ${maximized ? 'p-0' : 'p-4'}`}>
      <div className="h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="h-full flex">
          {/* File Explorer */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Files</h2>
            </div>
            <FileTree files={files} onSelectFile={handleFileSelect} />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCode}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {showPreview ? (
                      <><LayoutPanelLeft className="w-4 h-4" /> Hide Preview</>
                    ) : (
                      <><LayoutPanelTop className="w-4 h-4" /> Show Preview</>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setMaximized(!maximized)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {maximized ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Code Editor */}
              <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700`}>
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme={darkMode ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="w-1/2">
                  <PreviewFrame url={serverUrl} />
                </div>
              )}
            </div>

            {/* Output Terminal */}
            <div className="h-1/4 border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-white overflow-auto">
              <div className="flex items-center gap-2 p-2 border-b border-gray-700">
                <Terminal className="w-4 h-4" />
                <span className="text-sm">Output</span>
              </div>
              <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                {error ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                ) : (
                  output
                )}
                {serverUrl && (
                  <div className="mt-2 text-green-400">
                    Server running at: {serverUrl}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AurocoderPage