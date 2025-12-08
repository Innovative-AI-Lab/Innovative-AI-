import React, { useState, useRef, useEffect } from 'react';

const Terminal = () => {
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome to Innovative AI Terminal' },
        { type: 'output', content: 'Type "help" for available commands' }
    ]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentDirectory, setCurrentDirectory] = useState('~/project');
    const terminalRef = useRef(null);
    const inputRef = useRef(null);

    const commands = {
        help: () => [
            'Available commands:',
            '  help     - Show this help message',
            '  clear    - Clear terminal',
            '  ls       - List files',
            '  pwd      - Show current directory',
            '  mkdir    - Create directory',
            '  touch    - Create file',
            '  cat      - Display file content',
            '  npm      - Node package manager',
            '  git      - Git commands'
        ],
        clear: () => {
            setHistory([]);
            return [];
        },
        ls: () => [
            'index.js',
            'package.json',
            'components/',
            'README.md'
        ],
        pwd: () => [currentDirectory],
        mkdir: (args) => {
            if (!args[0]) return ['mkdir: missing operand'];
            return [`Directory '${args[0]}' created`];
        },
        touch: (args) => {
            if (!args[0]) return ['touch: missing file operand'];
            return [`File '${args[0]}' created`];
        },
        cat: (args) => {
            if (!args[0]) return ['cat: missing file operand'];
            return [
                `// Content of ${args[0]}`,
                'console.log("Hello, World!");',
                '',
                'function example() {',
                '    return "This is example content";',
                '}'
            ];
        },
        npm: (args) => {
            if (!args[0]) return ['npm: missing command'];
            switch (args[0]) {
                case 'install':
                    return [
                        'Installing packages...',
                        '✓ Package installed successfully'
                    ];
                case 'start':
                    return [
                        'Starting development server...',
                        '✓ Server running on http://localhost:3000'
                    ];
                case 'build':
                    return [
                        'Building project...',
                        '✓ Build completed successfully'
                    ];
                default:
                    return [`npm: unknown command '${args[0]}'`];
            }
        },
        git: (args) => {
            if (!args[0]) return ['git: missing command'];
            switch (args[0]) {
                case 'status':
                    return [
                        'On branch main',
                        'Your branch is up to date with origin/main',
                        '',
                        'Changes not staged for commit:',
                        '  modified: index.js'
                    ];
                case 'add':
                    return ['Changes staged for commit'];
                case 'commit':
                    return ['Commit created successfully'];
                default:
                    return [`git: unknown command '${args[0]}'`];
            }
        }
    };

    const executeCommand = (input) => {
        const [command, ...args] = input.trim().split(' ');
        
        if (!command) return [];
        
        if (commands[command]) {
            return commands[command](args);
        } else {
            return [`Command not found: ${command}. Type 'help' for available commands.`];
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentInput.trim()) return;

        // Add command to history
        const newHistory = [
            ...history,
            { type: 'input', content: `${currentDirectory} $ ${currentInput}` }
        ];

        // Execute command and add output
        const output = executeCommand(currentInput);
        output.forEach(line => {
            newHistory.push({ type: 'output', content: line });
        });

        setHistory(newHistory);
        setCurrentInput('');
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="h-full bg-black text-green-400 font-mono text-sm flex flex-col">
            <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-600">
                <span className="text-white font-semibold">Terminal</span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setHistory([])}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div 
                ref={terminalRef}
                className="flex-1 p-4 overflow-y-auto"
                onClick={() => inputRef.current?.focus()}
            >
                {history.map((entry, index) => (
                    <div key={index} className={`mb-1 ${entry.type === 'input' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {entry.content}
                    </div>
                ))}
                
                <form onSubmit={handleSubmit} className="flex items-center">
                    <span className="text-yellow-400 mr-2">{currentDirectory} $</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-green-400"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </form>
            </div>
        </div>
    );
};

export default Terminal;