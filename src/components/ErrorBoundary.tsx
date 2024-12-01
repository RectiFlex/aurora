import { Component, ErrorInfo, ReactNode } from 'react'
import { logError } from '../services/errorLogging'
import FallbackError from './FallbackError'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  componentStack: string | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    componentStack: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      componentStack: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Ensure componentStack is never undefined
    const componentStack = errorInfo.componentStack || null
    
    this.setState({
      componentStack
    })
    
    logError(error, {
      componentStack
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      componentStack: null
    })
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return (
        <FallbackError
          error={this.state.error}
          componentStack={this.state.componentStack || undefined}
          resetError={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary