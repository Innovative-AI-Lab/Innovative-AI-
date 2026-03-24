import React, { useState, useEffect, useRef } from 'react';

const defaultCode = {
  js: `// JavaScript File\nconsole.log('Hello, World!');\n\nfunction greet(name) {\n    return \`Hello, \${name}!\`;\n}\n\nexport default greet;`,
  jsx: `// React Component\nimport React, { useState } from 'react';\n\nconst MyComponent = () => {\n    const [count, setCount] = useState(0);\n\n    return (\n        <div>\n            <h1>Count: {count}</h1>\n            <button onClick={() => setCount(c => c + 1)}>Increment</button>\n        </div>\n    );\n};\n\nexport default MyComponent;`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>`,
  css: `/* Styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: #f5f5f5;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n}`,
  json: `{\n  "name": "project",\n  "version": "1.0.0",\n  "description": "A sample project",\n  "scripts": {\n    "start": "node index.js",\n    "dev": "nodemon index.js"\n  }\n}`,
  md: `# Project Title\n\nA brief description of the project.\n\n## Features\n\n- Feature 1\n- Feature 2\n\n## Usage\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\``,
  py: `# Python Script\n\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))`,
};

const getLanguage = (fileName) => {
  if (!fileName) return 'txt';
  return fileName.split('.').pop().toLowerCase();
};

const CodeEditor = ({ selectedFile }) => {
  const lang = getLanguage(selectedFile?.name);
  const [code, setCode] = useState(defaultCode[lang] || `// ${selectedFile?.name || 'New File'}\n// Start coding here...`);
  const [fontSize, setFontSize] = useState(14);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    const lang = getLanguage(selectedFile?.name);
    setCode(defaultCode[lang] || `// ${selectedFile?.name || 'New File'}\n// Start coding here...`);
    setSaved(false);
  }, [selectedFile?.name]);

  const lines = code.split('\n');

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const langLabels = { js: 'JavaScript', jsx: 'React JSX', ts: 'TypeScript', tsx: 'React TSX', css: 'CSS', html: 'HTML', json: 'JSON', md: 'Markdown', py: 'Python' };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {selectedFile?.name || 'untitled.js'}
          </span>
          <span className="hidden sm:inline text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
            {langLabels[lang] || lang.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            {[12, 13, 14, 15, 16, 18].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>

          <button onClick={handleCopy} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button onClick={handleSave} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            <i className={saved ? 'ri-check-line' : 'ri-save-line'}></i>
            <span className="hidden sm:inline">{saved ? 'Saved!' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 w-10 sm:w-12 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden select-none"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
        >
          <div className="p-2 sm:p-3 text-right">
            {lines.map((_, i) => (
              <div key={i} className="text-gray-400 dark:text-gray-600 leading-relaxed" style={{ fontSize: `${Math.max(fontSize - 2, 10)}px` }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className="flex-1 p-2 sm:p-3 font-mono resize-none border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6', tabSize: 4 }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 bg-blue-600 text-white text-xs">
        <div className="flex items-center gap-4">
          <span>Ln {code.substring(0, code.length).split('\n').length}</span>
          <span>Col {code.length}</span>
          <span>{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>{langLabels[lang] || lang.toUpperCase()}</span>
          {saved && <span className="flex items-center gap-1"><i className="ri-check-line"></i>Saved</span>}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
