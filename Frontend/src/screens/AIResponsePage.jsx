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
    if (match[2]) parts.push(<strong key={k++} className="font-semibold text-gray-100">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} className="italic text-gray-300">{match[3]}</em>);
    else if (match[4]) parts.push(<code key={k++} className="px-1.5 py-0.5 rounded bg-gray-700 text-purple-300 text-xs font-mono">{match[4]}</code>);
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
        <div key={k()} className="my-3 rounded-xl overflow-hidden border border-gray-600/50">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-600/50">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{lang}</span>
            </div>
            <CopyButton text={code} />
          </div>
          <pre className="bg-[#0d1117] text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed font-mono"><code>{code}</code></pre>
        </div>
      );
      i++; continue;
    }
    if (/^### /.test(line)) { elements.push(<h3 key={k()} className="text-base font-semibold text-gray-200 mt-4 mb-1">{inlineMarkdown(line.slice(4))}</h3>); i++; continue; }
    if (/^## /.test(line))  { elements.push(<h2 key={k()} className="text-lg font-bold text-gray-100 mt-5 mb-2 pb-1 border-b border-gray-600/50">{inlineMarkdown(line.slice(3))}</h2>); i++; continue; }
    if (/^# /.test(line))   { elements.push(<h1 key={k()} className="text-xl font-bold text-white mt-5 mb-2">{inlineMarkdown(line.slice(2))}</h1>); i++; continue; }
    if (/^[\-\*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(<li key={k()} className="flex items-start gap-2 text-gray-300 leading-relaxed"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></span><span>{inlineMarkdown(lines[i].slice(2))}</span></li>);
        i++;
      }
      elements.push(<ul key={k()} className="my-2 space-y-1">{items}</ul>); continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = []; let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={k()} className="flex items-start gap-2 text-gray-300 leading-relaxed"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 text-xs font-bold flex items-center justify-center mt-0.5">{num++}</span><span>{inlineMarkdown(lines[i].replace(/^\d+\. /, ''))}</span></li>);
        i++;
      }
      elements.push(<ol key={k()} className="my-2 space-y-1.5">{items}</ol>); continue;
    }
    if (/^> /.test(line)) { elements.push(<blockquote key={k()} className="my-2 pl-3 border-l-2 border-purple-500 text-gray-400 italic">{inlineMarkdown(line.slice(2))}</blockquote>); i++; continue; }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={k()} className="my-4 border-gray-600/50" />); i++; continue; }
    if (line.trim() === '') { elements.push(<div key={k()} className="h-2" />); i++; continue; }
    elements.push(<p key={k()} className="text-gray-300 leading-relaxed">{inlineMarkdown(line)}</p>);
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <i className="ri-robot-2-fill text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AI Response</h1>
            <p className="text-[10px] text-gray-400">Gemini 2.5 Flash · Innovative AI</p>
          </div>
        </div>
        {data && <CopyButton text={data.response} label="Copy All" />}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
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
          <>
            {/* Prompt */}
            <div className="mb-6 p-4 rounded-xl bg-gray-800 border border-gray-700">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Prompt</p>
              <p className="text-sm text-gray-200 leading-relaxed">{data.prompt}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700">
                {data.createdBy && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[9px] font-bold">
                      {(data.createdBy.displayName || data.createdBy.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-[10px] text-gray-400">{data.createdBy.displayName || data.createdBy.email?.split('@')[0]}</span>
                  </div>
                )}
                <span className="text-[10px] text-gray-500">{new Date(data.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Response */}
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 font-semibold">Response</p>
              <div>{renderMarkdown(data.response)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIResponsePage;
