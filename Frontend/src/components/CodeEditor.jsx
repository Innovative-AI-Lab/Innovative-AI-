import React, { useState, useEffect, useRef } from "react";

/* 🔥 DEFAULT CODE */
const defaultCode = {
  js: `// JavaScript
console.log("Hello Bhai 🚀");

function sum(a, b) {
  return a + b;
}

console.log(sum(2, 3));`,
};

/* 🔥 GET LANGUAGE */
const getLang = (file) => {
  if (!file) return "js";
  return file.split(".").pop();
};

export default function CodeEditor({ selectedFile }) {
  const lang = getLang(selectedFile?.name);

  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState([]);

  const textareaRef = useRef();
  const lineRef = useRef();

  /* 🔥 LOAD CODE */
  useEffect(() => {
    setCode(
      defaultCode[lang] ||
        `// ${selectedFile?.name || "New File"}\n\nStart coding...`
    );
  }, [selectedFile]);

  const lines = code.split("\n");

  /* 🔥 SYNC SCROLL */
  const handleScroll = () => {
    if (lineRef.current && textareaRef.current) {
      lineRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  /* 🔥 SAVE */
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  /* 🔥 COPY */
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* 🔥 RUN CODE */
  const runCode = () => {
    try {
      let logs = [];

      const originalLog = console.log;

      console.log = (...args) => {
        logs.push(args.join(" "));
      };

      new Function(code)();

      console.log = originalLog;

      setOutput(logs.length ? logs : ["✅ Code executed"]);
    } catch (err) {
      setOutput(["❌ Error: " + err.message]);
    }
  };

  /* 🔥 TAB + SHORTCUT */
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const newCode =
        code.substring(0, start) + "  " + code.substring(start);
      setCode(newCode);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">

      {/* 🔥 TOOLBAR */}
      <div className="flex justify-between items-center px-3 py-2 bg-gray-800 border-b border-gray-700">
        
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {selectedFile?.name || "untitled.js"}
          </span>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
            {lang.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="text-xs bg-gray-700 px-2 py-1 rounded"
          >
            {[12, 14, 16, 18].map((s) => (
              <option key={s}>{s}px</option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="text-xs bg-gray-700 px-2 py-1 rounded"
          >
            {copied ? "✔ Copied" : "Copy"}
          </button>

          <button
            onClick={handleSave}
            className="text-xs bg-blue-500 px-2 py-1 rounded"
          >
            {saved ? "✔ Saved" : "Save"}
          </button>

          <button
            onClick={runCode}
            className="text-xs bg-green-500 px-2 py-1 rounded"
          >
            ▶ Run
          </button>

        </div>
      </div>

      {/* 🔥 EDITOR */}
      <div className="flex flex-1 overflow-hidden">

        {/* LINE NUMBERS */}
        <div
          ref={lineRef}
          className="w-10 bg-gray-800 text-gray-400 text-right pr-2 pt-2 select-none"
          style={{ fontSize }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* TEXTAREA */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-900 outline-none p-2 font-mono"
          style={{ fontSize }}
        />
      </div>

      {/* 🔥 OUTPUT CONSOLE */}
      <div className="h-32 bg-black text-green-400 font-mono text-xs p-2 overflow-auto">
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* 🔥 STATUS BAR */}
      <div className="flex justify-between px-3 py-1 bg-blue-600 text-xs">
        <span>{lines.length} lines</span>
        <span>{lang.toUpperCase()}</span>
      </div>
    </div>
  );
}