import React, { useState } from 'react';

const CodeEditor = ({ selectedFile }) => {
    const [code, setCode] = useState(selectedFile ? getDefaultCode(selectedFile.name) : '// Select a file to start editing');
    const [fontSize, setFontSize] = useState(14);

    function getDefaultCode(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'js':
            case 'jsx':
                return `// ${fileName}
console.log('Hello, World!');

function example() {
    return 'This is a JavaScript file';
}

export default example;`;
            case 'html':
                return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`;
            case 'css':
                return `/* ${fileName} */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}`;
            case 'json':
                return `{
  "name": "project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`;
            case 'md':
                return `# ${fileName.replace('.md', '')}

This is a markdown file.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

\`\`\`javascript
console.log('Hello, World!');
\`\`\``;
            default:
                return `// ${fileName}
// Start editing your file here...`;
        }
    }

    const saveFile = () => {
        // Mock save functionality
        console.log('Saving file:', selectedFile?.name, code);
        alert('File saved successfully!');
    };

    const formatCode = () => {
        // Simple code formatting (mock)
        const formatted = code
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        setCode(formatted);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedFile ? selectedFile.name : 'No file selected'}
                    </span>
                    {selectedFile && (
                        <span className="text-xs text-gray-500">
                            {selectedFile.size}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <label className="text-xs text-gray-600">Size:</label>
                        <select
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="text-xs border border-gray-300 rounded px-1 py-0.5"
                        >
                            <option value={12}>12px</option>
                            <option value={14}>14px</option>
                            <option value={16}>16px</option>
                            <option value={18}>18px</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={formatCode}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        title="Format code"
                    >
                        <i className="ri-code-s-slash-fill"></i>
                    </button>
                    
                    <button
                        onClick={saveFile}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Save file"
                    >
                        <i className="ri-save-fill mr-1"></i>
                        Save
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 font-mono resize-none border-none outline-none"
                    style={{ fontSize: `${fontSize}px` }}
                    placeholder="Start typing your code here..."
                    spellCheck={false}
                />
                
                {/* Line numbers (simplified) */}
                <div className="absolute left-0 top-0 p-4 pointer-events-none text-gray-400 font-mono select-none" style={{ fontSize: `${fontSize}px` }}>
                    {code.split('\n').map((_, index) => (
                        <div key={index} className="leading-6">
                            {index + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                <div className="flex items-center space-x-4">
                    <span>Lines: {code.split('\n').length}</span>
                    <span>Characters: {code.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span>UTF-8</span>
                    <span>•</span>
                    <span>{selectedFile?.name.split('.').pop().toUpperCase() || 'TEXT'}</span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;