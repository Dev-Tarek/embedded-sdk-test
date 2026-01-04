import { useState } from "react";
import CodeEditor from "./CodeEditor.jsx";
import OutputPanel from "./OutputPanel.jsx";
import { useCodeExecution } from "../../hooks/useCodeExecution.js";
import Button from "../forms/Button.jsx";

const DEFAULT_CODE = `// Try the embedded SDK
async function main() {
  // Example: Initialize and get layout info
  const { layout } = await window.embedded.init({ debug: true });
  console.log('Layout:', layout);

  // Get token from URL
  const token = window.embedded.auth.getToken();
  console.log('Token:', token ? 'Found' : 'Not found');

  // Signal ready
  window.embedded.ready();
  console.log('App ready!');
}

main();
`;


export default function PlaygroundTab({ embedded, logMessage, showToast }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const { output, isExecuting, executeCode, clearOutput } = useCodeExecution();

  const handleRun = () => {
    if (!code.trim()) {
      showToast("Please enter some code", "warning");
      return;
    }
    executeCode(code);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)", width: "100%", gridColumn: "1 / -1" }}>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Code Editor</h2>
            <span className="panel-subtitle">Write window.embedded.* code</span>
          </div>
          <div className="panel-actions">
            <Button variant="primary" onClick={handleRun} disabled={isExecuting}>
              Run
            </Button>
            <Button onClick={clearOutput}>
              Clear Output
            </Button>
          </div>
        </div>
        <div style={{ padding: "var(--space-md)" }}>
          <CodeEditor value={code} onChange={setCode} height="600px" />
        </div>
      </div>
      <OutputPanel output={output} isExecuting={isExecuting} />
    </div>
  );
}

