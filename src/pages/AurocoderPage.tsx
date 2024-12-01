import { useState, useEffect, useCallback, useContext } from 'react'
import { motion } from 'framer-motion'
import { Code2, Send, Terminal, Play, Maximize2, Minimize2, Trash2, AlertTriangle, Wand2 } from 'lucide-react'
import { WebContainer } from '@webcontainer/api'
import Editor from '@monaco-editor/react'
import FileTree from '../components/FileTree'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from '../App'
import { generateCode } from '../services/ai'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  isCode?: boolean
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  role: 'assistant',
  content: 'Hello! I can help you write and run code. What would you like to create?'
}

// Initial files required for the WebContainer
const files = {
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'example-app',
        type: 'module',
        dependencies: {},
        scripts: {
          start: 'node index.js'
        }
      })
    }
  },
  'index.js': {
    file: {
      contents: '// Your code here'
    }
  }
}

const AurocoderPage = () => {
  const { darkMode } = useContext(ThemeContext)
  const [prompt, setPrompt] = useState('')
  const [code, setCode] = useState('// Your code here')
  const [output, setOutput] = useState('')
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [webcontainerError, setWebcontainerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useLocalStorage<Message[]>('aurocoder-messages', [INITIAL_MESSAGE])
  const [fileTree, setFileTree] = useState([
    {
      name: 'project',
      type: 'directory' as const,
      children: [
        { name: 'index.js', type: 'file' as const },
        { name: 'package.json', type: 'file' as const }
      ]
    }
  ])

  // Initialize WebContainer
  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 1000

    const initWebContainer = async () => {
      if (webcontainer) return

      try {
        setWebcontainerError(null)
        setIsLoading(true)

        if (!crossOriginIsolated) {
          throw new Error(
            'Code execution requires cross-origin isolation. ' +
            'You can still use the code editor, but running code will be disabled. ' +
            'Try using a different browser or check the server configuration.'
          )
        }

        const instance = await WebContainer.boot()
        
        if (!isMounted) {
          await instance.teardown()
          return
        }

        await instance.mount(files)
        const installProcess = await instance.spawn('npm', ['install'])
        const installExitCode = await installProcess.exit
        
        if (installExitCode !== 0) {
          throw new Error('Failed to install dependencies')
        }
        
        setWebcontainer(instance)
        setWebcontainerError(null)
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error)
        
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize code execution environment'
          
          if (retryCount < maxRetries && errorMessage.includes('Unable to create more instances')) {
            retryCount++
            setTimeout(initWebContainer, retryDelay * retryCount)
          } else {
            setWebcontainerError(
              `${errorMessage} You can still write and edit code, but code execution will be disabled.`
            )
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initWebContainer().catch(console.error)

    return () => {
      isMounted = false
      if (webcontainer) {
        webcontainer.teardown()
      }
    }
  }, [])

  // Handle code execution
  const handleRunCode = useCallback(async () => {
    if (!webcontainer) {
      setOutput('Error: Code execution environment is not available. You can still edit code but cannot run it.')
      return
    }

    setIsLoading(true)
    setOutput('')

    try {
      await webcontainer.fs.writeFile('/index.js', code)
      const process = await webcontainer.spawn('node', ['index.js'])
      
      let outputText = ''
      
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            outputText += data
            setOutput(outputText)
          },
          close() {
            setOutput(outputText)
          }
        })
      )

      process.exit.then((exitCode) => {
        if (exitCode !== 0) {
          setOutput(prev => prev + `\nProcess exited with code ${exitCode}`)
        }
      })

    } catch (error) {
      setOutput(String(error))
    } finally {
      setIsLoading(false)
    }
  }, [webcontainer, code])

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: prompt
    }

    setMessages(prev => [...prev, userMessage])
    setPrompt('')
    setIsGeneratingCode(true)

    try {
      const generatedCode = await generateCode(prompt)
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: generatedCode,
        isCode: true
      }

      setMessages(prev => [...prev, assistantMessage])
      setCode(generatedCode)
    } catch (error) {
      console.error('Error generating code:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating code. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([INITIAL_MESSAGE])
      setCode('// Your code here')
      setOutput('')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-6 px-4">
      <div className="max-w-[95%] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Aurocoder
          </h1>
          
          {(webcontainerError || isLoading) && (
            <div className={`max-w-2xl mx-auto mt-4 p-3 rounded-lg flex items-center gap-2 ${
              isLoading 
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-500'
                : 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-500'
            }`}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <p className="text-sm">Initializing code environment...</p>
                </div>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{webcontainerError}</p>
                </>
              )}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* File Tree */}
          <div className="col-span-2 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Files</h2>
            </div>
            <FileTree files={fileTree} />
          </div>

          {/* Main Content Area */}
          <div className="col-span-10 grid grid-rows-[auto,1fr,auto] gap-6">
            {/* Chat Area */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the code you want to create..."
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateCode()}
                  disabled={isGeneratingCode}
                />
                <button
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingCode ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  Generate
                </button>
                <button
                  onClick={clearHistory}
                  className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-40 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    }`}
                  >
                    {message.isCode ? (
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {message.content}
                      </pre>
                    ) : (
                      message.content
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold dark:text-white">Code Editor</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isLoading || !!webcontainerError}
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </button>
                </div>
              </div>
              <div className={`${isExpanded ? 'h-[60vh]' : 'h-[40vh]'} transition-all duration-200`}>
                <Editor
                  defaultLanguage="javascript"
                  theme={darkMode ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false
                  }}
                />
              </div>
            </div>

            {/* Output Terminal */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold dark:text-white">Output</h2>
              </div>
              <div className="p-4 font-mono text-sm h-40 overflow-y-auto whitespace-pre-wrap dark:text-white">
                {output || 'No output yet. Run your code to see the results.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AurocoderPage