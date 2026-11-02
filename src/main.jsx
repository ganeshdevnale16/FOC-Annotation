import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class Boundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (this.state.err)
      return (
        <div style={{ font: "15px system-ui, Arial, sans-serif", padding: 40, color: "#991b1b" }}>
          <b>Something went wrong.</b>
          <pre style={{ whiteSpace: "pre-wrap", color: "#475569" }}>{String(this.state.err?.stack || this.state.err)}</pre>
          <button onClick={() => location.reload()}>Reload</button>
        </div>
      );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </React.StrictMode>
);
