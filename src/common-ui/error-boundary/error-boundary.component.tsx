import React, { ErrorInfo } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';

export class ErrorBoundary extends React.Component<
  any,
  { error?: Error | string }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error: `${error} \n${errorInfo.componentStack}` });
  }

  handleClickOnCopy(stringifiedError: Error | string) {
    navigator.clipboard.writeText(stringifiedError.toString());
  }

  render() {
    const error = this.state.error;
    if (error) {
      return (
        <div className="error-page">
          <ButtonComponent
            onClick={() => this.handleClickOnCopy(error)}
            label="html_popup_copy_error"
          />
          <div>{error.toString()}</div>
        </div>
      );
    } else {
      return <>{this.props.children}</>;
    }
  }
}
