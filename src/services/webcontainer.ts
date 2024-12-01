import { WebContainer } from '@webcontainer/api'

let webcontainerInstance: WebContainer | null = null

export interface FileSystemTree {
  [key: string]: {
    file?: {
      contents: string
    }
    directory?: {
      [key: string]: any
    }
  }
}

/**
 * Initialize the WebContainer instance
 */
export async function initWebContainer(): Promise<WebContainer> {
  if (!webcontainerInstance) {
    webcontainerInstance = await WebContainer.boot()
  }
  return webcontainerInstance
}

/**
 * Get the current WebContainer instance
 */
export function getWebContainer(): WebContainer | null {
  return webcontainerInstance
}

/**
 * Mount a file system tree to the WebContainer
 */
export async function mountFiles(files: FileSystemTree): Promise<void> {
  const instance = await initWebContainer()
  await instance.mount(files as any) // Type assertion to bypass type checking
}

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
 * Execute a command in the WebContainer
 */
export async function execCommand(command: string, args: string[] = []): Promise<{
  exit: number
  stdout: string
  stderr: string
}> {
  const instance = await initWebContainer()
  const process = await instance.spawn(command, args)
  
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          stdout += data
        },
      })
    )

    // Use output stream for both stdout and stderr since error stream is not available
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          stderr += data
        },
      })
    )

    process.exit.then((exit) => {
      resolve({ exit, stdout, stderr })
    })
  })
}

/**
 * Install npm dependencies in the WebContainer
 */
export async function installDependencies(dependencies: string[]): Promise<{
  success: boolean
  output: string
}> {
  try {
    const result = await execCommand('npm', ['install', ...dependencies])
    return {
      success: result.exit === 0,
      output: result.stdout + result.stderr
    }
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown error occurred'
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
    const process = await instance.spawn('npm', ['run', 'dev'])
    
    return new Promise((resolve) => {
      let output = ''

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data
            // Look for the development server URL in the output
            const match = output.match(/Local:\s+(http:\/\/localhost:\d+)/)
            if (match) {
              resolve({
                success: true,
                url: match[1]
              })
            }
          },
        })
      )

      // Handle all output in the main stream since error stream is not available
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data
          },
        })
      )

      process.exit.then((code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: `Server failed to start: ${output}`
          })
        }
      })
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}