import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export interface CodeEditorProps {
  /** Initial code content */
  value: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Editor height */
  height?: string | number;
  /** Called when code changes */
  onChange?: (value: string) => void;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Live code editor component for presentations.
 * Uses Monaco Editor (loaded from CDN) for syntax highlighting and editing.
 *
 * Falls back to a styled <textarea> if Monaco fails to load.
 */
export function CodeEditor({
  value,
  language = "typescript",
  readOnly = false,
  height = 300,
  onChange,
  style,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<unknown>(null);
  const [fallback, setFallback] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || fallback) return;

    let disposed = false;

    async function initMonaco() {
      try {
        // Load Monaco from CDN via AMD loader
        const monacoUrl = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";

        if (!(window as unknown as Record<string, unknown>).require) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${monacoUrl}/loader.js`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Monaco loader"));
            document.head.appendChild(script);
          });
        }

        if (disposed) return;

        const amdRequire = (window as unknown as Record<string, unknown>).require as (
          config: unknown,
        ) => (deps: string[], callback: (monaco: MonacoNamespace) => void) => void;

        amdRequire({ paths: { vs: monacoUrl } })(["vs/editor/editor.main"], (monaco) => {
          if (disposed || !container) return;

          const editor = monaco.editor.create(container, {
            value,
            language,
            readOnly,
            theme: "vs-dark",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          });

          editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            setText(newValue);
            onChange?.(newValue);
          });

          editorRef.current = editor;
        });
      } catch {
        if (!disposed) setFallback(true);
      }
    }

    void initMonaco();

    return () => {
      disposed = true;
      if (
        editorRef.current &&
        typeof (editorRef.current as { dispose: () => void }).dispose === "function"
      ) {
        (editorRef.current as { dispose: () => void }).dispose();
      }
    };
  }, [language, readOnly, value, onChange, fallback]);

  const handleFallbackChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      onChange?.(e.target.value);
    },
    [onChange],
  );

  if (fallback) {
    return (
      <textarea
        className="reslide-code-editor-fallback"
        value={text}
        onChange={handleFallbackChange}
        readOnly={readOnly}
        style={{
          width: "100%",
          height,
          fontFamily: "monospace",
          fontSize: "14px",
          padding: "12px",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          border: "1px solid #333",
          borderRadius: "0.5rem",
          resize: "vertical",
          ...style,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="reslide-code-editor"
      style={{
        width: "100%",
        height,
        borderRadius: "0.5rem",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}

interface MonacoEditor {
  create: (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => {
    getValue: () => string;
    onDidChangeModelContent: (callback: () => void) => void;
    dispose: () => void;
  };
}

interface MonacoNamespace {
  editor: MonacoEditor;
}
