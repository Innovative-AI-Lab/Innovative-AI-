import React, { useState } from 'react';

const defaultFiles = [
  { id: 1, name: 'index.js', type: 'file', size: '2.3 KB', modified: '2 hours ago' },
  { id: 2, name: 'components', type: 'folder', size: '—', modified: '1 day ago' },
  { id: 3, name: 'package.json', type: 'file', size: '1.1 KB', modified: '3 days ago' },
  { id: 4, name: 'README.md', type: 'file', size: '0.8 KB', modified: '1 week ago' },
  { id: 5, name: 'styles.css', type: 'file', size: '0.5 KB', modified: '2 days ago' },
];

const getFileIcon = (file) => {
  if (file.type === 'folder') return 'ri-folder-fill text-blue-500';
  const ext = file.name.split('.').pop().toLowerCase();
  const icons = {
    js: 'ri-javascript-fill text-yellow-500',
    jsx: 'ri-reactjs-line text-cyan-500',
    ts: 'ri-code-s-slash-fill text-blue-600',
    tsx: 'ri-reactjs-line text-blue-500',
    css: 'ri-css3-fill text-blue-400',
    html: 'ri-html5-fill text-orange-500',
    json: 'ri-file-code-fill text-green-500',
    md: 'ri-markdown-fill text-gray-600',
    py: 'ri-code-s-slash-fill text-yellow-600',
  };
  return icons[ext] || 'ri-file-fill text-gray-500';
};

const FileManager = ({ projectId, onFileSelect }) => {
  const [files, setFiles] = useState(defaultFiles);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('file');
  const [renameId, setRenameId] = useState(null);
  const [renameName, setRenameName] = useState('');

  const createFile = () => {
    if (!newName.trim()) return;
    const newFile = { id: Date.now(), name: newName.trim(), type: newType, size: '0 KB', modified: 'Just now' };
    setFiles(prev => [...prev, newFile]);
    setNewName('');
    setIsCreating(false);
  };

  const deleteFile = (id, e) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedId === id) { setSelectedId(null); onFileSelect?.(null); }
  };

  const startRename = (file, e) => {
    e.stopPropagation();
    setRenameId(file.id);
    setRenameName(file.name);
  };

  const confirmRename = (id) => {
    if (!renameName.trim()) { setRenameId(null); return; }
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: renameName.trim() } : f));
    setRenameId(null);
  };

  const selectFile = (file) => {
    if (file.type === 'folder') return;
    setSelectedId(file.id);
    onFileSelect?.(file);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">Files</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => { setNewType('folder'); setIsCreating(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-500 transition-colors" title="New folder">
            <i className="ri-folder-add-line text-base"></i>
          </button>
          <button onClick={() => { setNewType('file'); setIsCreating(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-500 transition-colors" title="New file">
            <i className="ri-file-add-line text-base"></i>
          </button>
        </div>
      </div>

      {/* New file input */}
      {isCreating && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-1.5 mb-2">
            <i className={newType === 'folder' ? 'ri-folder-fill text-blue-500' : 'ri-file-fill text-gray-500'}></i>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') setIsCreating(false); }}
              placeholder={newType === 'folder' ? 'folder-name' : 'filename.js'}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setIsCreating(false)} className="flex-1 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button onClick={createFile} className="flex-1 py-1 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600">Create</button>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => selectFile(file)}
            className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
              selectedId === file.id
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <i className={`${getFileIcon(file)} text-base flex-shrink-0`}></i>
            <div className="flex-1 min-w-0">
              {renameId === file.id ? (
                <input
                  type="text"
                  value={renameName}
                  onChange={e => setRenameName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(file.id); if (e.key === 'Escape') setRenameId(null); }}
                  onBlur={() => confirmRename(file.id)}
                  className="w-full text-xs px-1 py-0.5 border border-blue-400 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
              )}
              <p className="text-[10px] text-gray-400">{file.size} · {file.modified}</p>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => startRename(file, e)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-blue-500" title="Rename">
                <i className="ri-pencil-line text-xs"></i>
              </button>
              <button onClick={e => deleteFile(file.id, e)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500" title="Delete">
                <i className="ri-delete-bin-line text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
