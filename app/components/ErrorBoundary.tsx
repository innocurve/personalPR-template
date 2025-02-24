import { Component } from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  componentDidCatch(error: Error) {
    console.error('Error:', error)
    this.setState({ error })
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h2>오류가 발생했습니다.</h2>
          <p>{this.state.error.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

