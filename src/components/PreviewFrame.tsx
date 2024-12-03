import { useEffect, useRef } from 'react'

interface PreviewFrameProps {
  url?: string | null
}

const PreviewFrame = ({ url }: PreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (url && iframeRef.current) {
      iframeRef.current.src = url
    }
  }, [url])

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Preview will appear here when you run your code
        </p>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-white"
      title="Preview"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation"
    />
  )
}

export default PreviewFrame