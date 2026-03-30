import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';

/* ─── Copy Button ─── */
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-all">
      <i className={copied ? 'ri-check-line text-green-400' : 'ri-file-copy-line'}></i>
      {copied ? 'Copied!' : label}
    </button>
  );
};

const inlineMarkdown = (text) => {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={k++} className="font-semibold text-white">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} className="italic text-purple-300">{match[3]}</em>);
    else if (match[4]) parts.push(<code key={k++} className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/20">{match[4]}</code>);
    else if (match[5] && match[6]) parts.push(<a key={k++} href={match[6]} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">{match[5]}</a>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
};

const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let i = 0, kc = 0;
  const k = () => kc++;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) { codeLines.push(lines[i]); i++; }
      const code = codeLines.join('\n');
      elements.push(
        <div key={k()} className="my-3 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">{lang}</span>
            </div>
            <CopyButton text={code} />
          </div>
          <pre className="bg-[#0d1117] text-gray-100 p-4 overflow-x-auto text-xs leading-relaxed font-mono scrollbar-thin scrollbar-thumb-gray-700"><code>{code}</code></pre>
        </div>
      );
      i++; continue;
    }
    if (/^### /.test(line)) { elements.push(<h3 key={k()} className="text-sm font-bold text-purple-300 mt-4 mb-1.5 flex items-center gap-2"><span className="w-1 h-4 bg-purple-500 rounded-full inline-block"></span>{inlineMarkdown(line.slice(4))}</h3>); i++; continue; }
    if (/^## /.test(line))  { elements.push(<h2 key={k()} className="text-sm font-bold text-white mt-4 mb-2 pb-1.5 border-b border-white/10">{inlineMarkdown(line.slice(3))}</h2>); i++; continue; }
    if (/^# /.test(line))   { elements.push(<h1 key={k()} className="text-base font-bold text-white mt-4 mb-2">{inlineMarkdown(line.slice(2))}</h1>); i++; continue; }
    if (/^[\-\*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(<li key={k()} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0"></span><span>{inlineMarkdown(lines[i].slice(2))}</span></li>); i++;
      }
      elements.push(<ul key={k()} className="my-2 space-y-1.5 pl-1">{items}</ul>); continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = []; let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={k()} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5 shadow">{num++}</span><span>{inlineMarkdown(lines[i].replace(/^\d+\. /, ''))}</span></li>); i++;
      }
      elements.push(<ol key={k()} className="my-2 space-y-2 pl-1">{items}</ol>); continue;
    }
    if (/^> /.test(line)) { elements.push(<blockquote key={k()} className="my-2 pl-3 border-l-2 border-purple-500 text-sm text-gray-400 italic bg-purple-500/5 py-1.5 rounded-r-lg">{inlineMarkdown(line.slice(2))}</blockquote>); i++; continue; }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={k()} className="my-3 border-white/10" />); i++; continue; }
    if (line.trim() === '') { elements.push(<div key={k()} className="h-1.5" />); i++; continue; }
    elements.push(<p key={k()} className="text-sm text-gray-300 leading-relaxed">{inlineMarkdown(line)}</p>);
    i++;
  }
  return elements;
};

const AIResponsePage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/ai/response/${id}`)
      .then(res => setData(res.data.data))
      .catch(() => setError('Response not found or has been deleted.'));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-sparkling-2-fill text-white text-base"></i>
            </div>
          <div>
            <h1 className="text-sm font-bold text-white">Saved AI Response</h1>
            <p className="text-[10px] text-gray-500">A permanent, shareable link to an AI conversation.</p>
          </div>
        </div>
        {data && <CopyButton text={data.response} label="Copy Response" />}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <i className="ri-error-warning-line text-4xl text-red-400 mb-3"></i>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {!data && !error && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <i className="ri-loader-4-line animate-spin text-xl"></i>
              <span className="text-sm">Loading response...</span>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* User Prompt Bubble */}
            <div className="flex items-end gap-2.5 flex-row-reverse">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/30">
                {(data.createdBy?.displayName || data.createdBy?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="max-w-[88%] flex flex-col items-end">
                <p className="text-[10px] text-gray-500 mb-1 px-1 text-right">
                  {data.createdBy?.displayName || data.createdBy?.email?.split('@')[0] || 'You'}
                  <span className="ml-1.5 opacity-60">{new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
                <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm shadow-lg shadow-blue-500/20 border border-blue-500/30">
                  <p className="leading-relaxed whitespace-pre-wrap">{data.prompt}</p>
                </div>
              </div>
            </div>
      
            {/* AI Response Bubble */}
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30">
                <i className="ri-sparkling-2-fill text-xs"></i>
              </div>
              <div className="max-w-[88%] flex flex-col items-start w-full">
                <p className="text-[10px] text-gray-500 mb-1 px-1">
                  Gemini AI
                  <span className="ml-1.5 opacity-60">{new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm w-full shadow-lg bg-gray-800/80 border border-white/8 shadow-black/20 backdrop-blur-sm">
                  <div>{renderMarkdown(data.response)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResponsePage;
