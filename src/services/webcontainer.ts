import { WebContainer, FileSystemTree as WebContainerFSTree } from '@webcontainer/api'

export interface FileSystemEntry {
  file?: {
    contents: string
  }
  directory?: {
    [key: string]: FileSystemEntry
  }
}

export interface FileSystemTree {
  [key: string]: FileSystemEntry
}

let webcontainerInstance: WebContainer | null = null

export async function initWebContainer(): Promise<WebContainer> {
  if (!webcontainerInstance) {
    webcontainerInstance = await WebContainer.boot()
  }
  return webcontainerInstance
}

export async function mountFiles(files: FileSystemTree): Promise<void> {
  const instance = await initWebContainer()
  // Cast the files to the correct WebContainer type
  await instance.mount(files as unknown as WebContainerFSTree)
}

// Rest of the file remains the same...

/**
 * Write a file to the WebContainer filesystem
 */
export async function writeFile(path: string, contents: string): Promise<void> {
  const instance = await initWebContainer()
  await instance.fs.writeFile(path, contents)
}

/**
 * Read a file from the WebContainer filesystem
 */
export async function readFile(path: string): Promise<string> {
  const instance = await initWebContainer()
  const file = await instance.fs.readFile(path)
  return new TextDecoder().decode(file)
}

/**
 * Install npm dependencies in the WebContainer
 */
export async function installDependencies(dependencies: string[]): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const instance = await initWebContainer()
    const process = await instance.spawn('npm', ['install', ...dependencies])
    
    return new Promise((resolve) => {
      let output = ''

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data
          },
        })
      )

      process.exit.then((code) => {
        resolve({
          success: code === 0,
          error: code !== 0 ? output : undefined
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Start a development server in the WebContainer
 */
export async function startDevServer(): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    const instance = await initWebContainer()
    
    // First, create a basic vite config
    await writeFile('vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})`)
    
    // Create a basic index.html if it doesn't exist
    await writeFile('index.html', `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`)

    const serverProcess = await instance.spawn('npm', ['run', 'dev'])
    
    return new Promise((resolve) => {
      let output = ''
      let resolved = false

      serverProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data
            // Look for the development server URL in the output
            if (!resolved && output.includes('Local:')) {
              resolved = true
              const urlMatch = output.match(/(?:Local|Network):\s+(http:\/\/[\w.]+:\d+)/)
              if (urlMatch) {
                resolve({
                  success: true,
                  url: urlMatch[1].replace('localhost', '0.0.0.0')
                })
              }
            }
          },
        })
      )

      serverProcess.exit.then((code) => {
        if (!resolved) {
          resolve({
            success: false,
            error: `Server failed to start (exit code ${code}): ${output}`
          })
        }
      })

      // Resolve after timeout if server doesn't start
      setTimeout(() => {
        if (!resolved) {
          resolve({
            success: false,
            error: 'Server start timeout'
          })
        }
      }, 30000)
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}