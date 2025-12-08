import React, { useState, useEffect } from 'react';

const FileManager = ({ projectId }) => {
    const [files, setFiles] = useState([
        { id: 1, name: 'index.js', type: 'file', size: '2.3 KB', modified: '2 hours ago' },
        { id: 2, name: 'components', type: 'folder', size: '-', modified: '1 day ago' },
        { id: 3, name: 'package.json', type: 'file', size: '1.1 KB', modified: '3 days ago' },
        { id: 4, name: 'README.md', type: 'file', size: '0.8 KB', modified: '1 week ago' }
    ]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const createFile = () => {
        if (!newFileName.trim()) return;
        
        const newFile = {
            id: Date.now(),
            name: newFileName,
            type: 'file',
            size: '0 KB',
            modified: 'Just now'
        };
        
        setFiles(prev => [...prev, newFile]);
        setNewFileName('');
        setIsCreatingFile(false);
    };

    const deleteFile = (fileId) => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const getFileIcon = (file) => {
        if (file.type === 'folder') return 'ri-folder-fill text-blue-500';
        
        const extension = file.name.split('.').pop().toLowerCase();
        switch (extension) {
            case 'js':
            case 'jsx':
                return 'ri-javascript-fill text-yellow-500';
            case 'css':
                return 'ri-css3-fill text-blue-400';
            case 'html':
                return 'ri-html5-fill text-orange-500';
            case 'json':
                return 'ri-file-code-fill text-green-500';
            case 'md':
                return 'ri-markdown-fill text-gray-600';
            default:
                return 'ri-file-fill text-gray-500';
        }
    };

    return (
        <div className="h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Files</h3>
                    <button
                        onClick={() => setIsCreatingFile(true)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Create new file"
                    >
                        <i className="ri-add-fill"></i>
                    </button>
                </div>
            </div>

            <div className="p-2">
                {isCreatingFile && (
                    <div className="mb-2 p-2 border border-gray-300 rounded">
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Enter file name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            onKeyPress={(e) => e.key === 'Enter' && createFile()}
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                onClick={() => setIsCreatingFile(false)}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createFile}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer group ${
                                selectedFile?.id === file.id ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                            onClick={() => setSelectedFile(file)}
                        >
                            <div className="flex items-center space-x-2 flex-1">
                                <i className={`${getFileIcon(file)} text-lg`}></i>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {file.size} • {file.modified}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFile(file.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700"
                                title="Delete file"
                            >
                                <i className="ri-delete-bin-fill text-sm"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileManager;