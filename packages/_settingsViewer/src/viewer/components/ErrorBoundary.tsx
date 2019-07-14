import * as React from 'react';

export class ErrorBoundary extends React.Component<{}, { error?: Error }> {
    constructor(props) {
        super(props);
        this.state = { error: undefined };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: any) {
        // You can also log the error to an error reporting service
        console.log(error);
        console.log(info);
    }

    render() {
        if (this.state.error) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
