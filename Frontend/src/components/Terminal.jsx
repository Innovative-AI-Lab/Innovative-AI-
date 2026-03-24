import React, { useState, useRef, useEffect } from 'react';

const Terminal = () => {
  const [history, setHistory] = useState([
    { type: 'system', content: '╔══════════════════════════════════════╗' },
    { type: 'system', content: '║   Innovative AI Terminal  v1.0.0     ║' },
    { type: 'system', content: '╚══════════════════════════════════════╝' },
    { type: 'output', content: 'Type "help" for available commands.\n' },
  ]);
  const [input, setInput] = useState('');
  const [dir, setDir] = useState('~/project');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [fontSize, setFontSize] = useState(13);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const commands = {
    help: () => [
      { type: 'info', content: 'Available commands:' },
      { type: 'output', content: '  help          Show this help' },
      { type: 'output', content: '  clear         Clear terminal' },
      { type: 'output', content: '  ls            List files' },
      { type: 'output', content: '  pwd           Print working directory' },
      { type: 'output', content: '  cd <dir>      Change directory' },
      { type: 'output', content: '  mkdir <name>  Create directory' },
      { type: 'output', content: '  touch <name>  Create file' },
      { type: 'output', content: '  cat <file>    Show file content' },
      { type: 'output', content: '  echo <text>   Print text' },
      { type: 'output', content: '  date          Show current date/time' },
      { type: 'output', content: '  whoami        Show current user' },
      { type: 'output', content: '  npm <cmd>     Node package manager' },
      { type: 'output', content: '  git <cmd>     Git commands' },
      { type: 'output', content: '  node <file>   Run Node.js file' },
    ],
    clear: () => { setHistory([]); return []; },
    ls: () => [
      { type: 'output', content: '\x1b[34mcomponents/\x1b[0m  \x1b[34mnode_modules/\x1b[0m  \x1b[34msrc/\x1b[0m' },
      { type: 'output', content: 'index.js     package.json   README.md   .env' },
    ],
    pwd: () => [{ type: 'output', content: dir }],
    date: () => [{ type: 'output', content: new Date().toString() }],
    whoami: () => [{ type: 'output', content: 'developer' }],
    cd: (args) => {
      if (!args[0] || args[0] === '~') { setDir('~/project'); return [{ type: 'output', content: '' }]; }
      if (args[0] === '..') {
        const parts = dir.split('/');
        if (parts.length > 1) setDir(parts.slice(0, -1).join('/') || '~');
        return [{ type: 'output', content: '' }];
      }
      setDir(`${dir}/${args[0]}`);
      return [{ type: 'output', content: '' }];
    },
    mkdir: (args) => {
      if (!args[0]) return [{ type: 'error', content: 'mkdir: missing operand' }];
      return [{ type: 'success', content: `Directory '${args[0]}' created` }];
    },
    touch: (args) => {
      if (!args[0]) return [{ type: 'error', content: 'touch: missing file operand' }];
      return [{ type: 'success', content: `File '${args[0]}' created` }];
    },
    echo: (args) => [{ type: 'output', content: args.join(' ') }],
    cat: (args) => {
      if (!args[0]) return [{ type: 'error', content: 'cat: missing file operand' }];
      const content = {
        'package.json': '{\n  "name": "project",\n  "version": "1.0.0"\n}',
        'README.md': '# Project\n\nA full-stack AI development platform.',
        'index.js': 'const express = require("express");\nconst app = express();\napp.listen(3000);',
        '.env': 'PORT=4001\nMONGODB_URI=mongodb://localhost:27017/db',
      };
      return content[args[0]]
        ? content[args[0]].split('\n').map(l => ({ type: 'output', content: l }))
        : [{ type: 'error', content: `cat: ${args[0]}: No such file or directory` }];
    },
    npm: (args) => {
      const sub = args[0];
      if (!sub) return [{ type: 'error', content: 'npm: missing command' }];
      const responses = {
        install: [{ type: 'info', content: 'npm warn deprecated...' }, { type: 'output', content: 'added 847 packages in 12s' }, { type: 'success', content: '✓ Packages installed successfully' }],
        start: [{ type: 'info', content: '> project@1.0.0 start' }, { type: 'success', content: '✓ Server running on http://localhost:3000' }],
        'run dev': [{ type: 'info', content: '> project@1.0.0 dev' }, { type: 'success', content: '✓ Dev server running on http://localhost:5173' }],
        build: [{ type: 'info', content: 'Building for production...' }, { type: 'output', content: 'vite v5.0.0 building for production...' }, { type: 'success', content: '✓ Built in 2.34s' }],
        test: [{ type: 'info', content: 'Running tests...' }, { type: 'success', content: '✓ All tests passed' }],
        init: [{ type: 'output', content: 'This utility will walk you through creating a package.json file.' }, { type: 'success', content: '✓ package.json created' }],
      };
      return responses[sub] || [{ type: 'error', content: `npm: unknown command '${sub}'` }];
    },
    git: (args) => {
      const sub = args[0];
      if (!sub) return [{ type: 'error', content: 'git: missing command' }];
      const responses = {
        status: [
          { type: 'output', content: 'On branch main' },
          { type: 'output', content: "Your branch is up to date with 'origin/main'." },
          { type: 'output', content: '' },
          { type: 'output', content: 'Changes not staged for commit:' },
          { type: 'error', content: '  modified:   src/App.jsx' },
          { type: 'output', content: '' },
          { type: 'info', content: 'no changes added to commit' },
        ],
        add: [{ type: 'success', content: `Changes staged: ${args[1] || '.'}` }],
        commit: [{ type: 'success', content: `[main abc1234] ${args.slice(2).join(' ') || 'Update'}` }],
        push: [{ type: 'info', content: 'Pushing to origin/main...' }, { type: 'success', content: '✓ Push successful' }],
        pull: [{ type: 'info', content: 'Pulling from origin/main...' }, { type: 'success', content: '✓ Already up to date.' }],
        log: [
          { type: 'output', content: 'commit abc1234 (HEAD -> main)' },
          { type: 'output', content: 'Author: Developer <dev@example.com>' },
          { type: 'output', content: 'Date:   ' + new Date().toDateString() },
          { type: 'output', content: '' },
          { type: 'output', content: '    Initial commit' },
        ],
        init: [{ type: 'success', content: 'Initialized empty Git repository in .git/' }],
        branch: [{ type: 'output', content: '* main\n  develop\n  feature/ai-chat' }],
      };
      return responses[sub] || [{ type: 'error', content: `git: '${sub}' is not a git command` }];
    },
    node: (args) => {
      if (!args[0]) return [{ type: 'error', content: 'node: missing file argument' }];
      return [{ type: 'info', content: `Running ${args[0]}...` }, { type: 'success', content: 'Hello, World!' }];
    },
  };

  const execute = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return [];
    const parts = trimmed.split(' ');
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (commands[name]) return commands[name](args);
    return [{ type: 'error', content: `${name}: command not found. Type 'help' for available commands.` }];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newHistory = [...history, { type: 'prompt', content: `${dir} $ ${input}` }];
    const output = execute(input);
    output.forEach(line => newHistory.push(line));
    setHistory(newHistory);
    setCmdHistory(prev => [input, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(idx);
      setInput(cmdHistory[idx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx] || '');
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const colorMap = {
    prompt: 'text-yellow-400',
    output: 'text-green-400',
    error: 'text-red-400',
    success: 'text-emerald-400',
    info: 'text-blue-400',
    system: 'text-cyan-400',
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-green-400 font-mono" style={{ fontSize: `${fontSize}px` }}>
      {/* Terminal Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-xs ml-2">bash — {dir}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-gray-300 focus:outline-none"
          >
            {[11, 12, 13, 14, 15, 16].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-white px-2 py-0.5 bg-gray-800 rounded border border-gray-600 hover:border-gray-400 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-0.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <div key={i} className={`${colorMap[entry.type] || 'text-green-400'} whitespace-pre-wrap break-all leading-relaxed`}>
            {entry.content}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center mt-1">
          <span className="text-yellow-400 mr-2 flex-shrink-0">{dir} $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
