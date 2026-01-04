import { useTheme } from "../../hooks/useTheme.js";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange, height = "400px" }) {
  const { isDarkMode } = useTheme();

  return (
    <Editor
      height={height}
      language="javascript"
      theme={isDarkMode ? "vs-dark" : "vs-light"}
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  );
}

