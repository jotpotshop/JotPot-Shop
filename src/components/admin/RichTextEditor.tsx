import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  Eraser,
  Code,
  Sparkles,
} from 'lucide-react';
import { sanitizeProductHtml } from '../../utils/sanitizeHtml';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  helperText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'পণ্যের বিস্তারিত বিবরণ, মূল সুবিধা ও বৈশিষ্ট্য লিখুন...',
  minHeight = '180px',
  helperText,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'preview' | 'html'>('visual');
  const [htmlSource, setHtmlSource] = useState(value || '');
  const isInternalChangeRef = useRef(false);

  // Sync internal HTML source with incoming value
  useEffect(() => {
    if (!isInternalChangeRef.current) {
      setHtmlSource(value || '');
      if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChangeRef.current = false;
  }, [value]);

  // Handle content changes in editor
  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;
    // Normalize empty content
    const clean = rawHtml === '<p><br></p>' || rawHtml === '<br>' || rawHtml.trim() === '' ? '' : rawHtml;
    isInternalChangeRef.current = true;
    setHtmlSource(clean);
    onChange(clean);
  }, [onChange]);

  // Execute formatting command safely
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab !== 'visual') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  // Safe Paste Handler
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const textHtml = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');

    let toInsert = '';
    if (textHtml) {
      toInsert = sanitizeProductHtml(textHtml);
    } else if (plainText) {
      // Split plain text into paragraphs or breaks
      const lines = plainText.split(/\r?\n/);
      toInsert = lines
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => `<p>${line}</p>`)
        .join('');
    }

    if (toInsert) {
      document.execCommand('insertHTML', false, toInsert);
      handleEditorInput();
    }
  };

  // Sync from raw HTML textarea
  const handleHtmlSourceChange = (newHtml: string) => {
    setHtmlSource(newHtml);
    isInternalChangeRef.current = true;
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  // Word & character stats
  const cleanTextOnly = (htmlSource || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const charCount = cleanTextOnly.length;
  const wordCount = cleanTextOnly ? cleanTextOnly.split(' ').length : 0;

  return (
    <div className="space-y-1.5 w-full">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        {label && (
          <label className="block font-semibold text-[#111827] text-xs">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-[#faf9f7] p-1 rounded-xl border border-[#e6e3dd]">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-[#111827] text-white'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>এডিটর</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#111827] text-white'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>প্রিভিউ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'html'
                ? 'bg-[#111827] text-white'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="border border-[#e6e3dd] rounded-xl bg-white overflow-hidden focus-within:border-[#881337] transition-colors">
        {/* Toolbar (Visible when Visual tab is active) */}
        {activeTab === 'visual' && (
          <div className="bg-[#faf9f7] border-b border-[#e6e3dd] p-1.5 flex flex-wrap items-center gap-1 text-[#374151] select-none">
            {/* Bold */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('bold');
              }}
              title="বোল্ড (Bold Ctrl+B)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('italic');
              }}
              title="ইটালিক (Italic Ctrl+I)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('underline');
              }}
              title="আন্ডারলাইন (Underline)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-gray-300 mx-1" />

            {/* Heading 2 */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('formatBlock', '<h2>');
              }}
              title="প্রধান শিরোনাম (Heading 2)"
              className="px-2 py-1 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer text-xs font-bold flex items-center space-x-1"
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">H2</span>
            </button>

            {/* Heading 3 */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('formatBlock', '<h3>');
              }}
              title="উপ-শিরোনাম (Heading 3)"
              className="px-2 py-1 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer text-xs font-bold flex items-center space-x-1"
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span className="text-[10px]">H3</span>
            </button>

            {/* Paragraph / Normal */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('formatBlock', '<p>');
              }}
              title="সাধারণ প্যারাগ্রাফ (Paragraph)"
              className="px-2 py-1 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer text-[10px] font-bold"
            >
              প্যারাগ্রাফ
            </button>

            <span className="w-px h-4 bg-gray-300 mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('insertUnorderedList');
              }}
              title="বুলেট পয়েন্ট তালিকা (Bullet List)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('insertOrderedList');
              }}
              title="নম্বর তালিকা (Numbered List)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Quote */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('formatBlock', '<blockquote>');
              }}
              title="উদ্ধৃতি / হাইলাইট (Quote)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-gray-900 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-gray-300 mx-1" />

            {/* Clear Formatting */}
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                executeCommand('removeFormat');
              }}
              title="ফরম্যাটিং মুছুন (Clear Format)"
              className="p-1.5 hover:bg-white rounded-lg hover:text-rose-600 hover:shadow-2xs transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. VISUAL EDITABLE CANVAS */}
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onPaste={handlePaste}
            data-placeholder={placeholder}
            style={{ minHeight }}
            className="p-3.5 text-xs text-gray-800 leading-relaxed outline-none overflow-y-auto rich-editor-content focus:bg-white bg-gray-50/30"
          />
        )}

        {/* 2. CUSTOMER PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-4 bg-gray-50/60 overflow-y-auto text-xs sm:text-sm text-gray-800 leading-relaxed space-y-3"
          >
            {htmlSource ? (
              <div
                className="rich-description-preview space-y-2.5"
                dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(htmlSource) }}
              />
            ) : (
              <p className="text-gray-400 italic text-xs py-4 text-center">
                কোনো বিবরণ লেখা হয়নি। "এডিটর" ট্যাবে গিয়ে বিবরণ যোগ করুন।
              </p>
            )}
          </div>
        )}

        {/* 3. HTML SOURCE CODE TAB */}
        {activeTab === 'html' && (
          <div className="p-2 bg-gray-950">
            <textarea
              rows={8}
              value={htmlSource}
              onChange={e => handleHtmlSourceChange(e.target.value)}
              placeholder="<p>এইচটিএমএল কোড...</p>"
              className="w-full bg-transparent text-emerald-400 font-mono text-xs p-2 outline-none resize-y"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Bottom bar with stats & guide */}
        <div className="px-3 py-1.5 bg-[#faf9f7] border-t border-[#e6e3dd] flex items-center justify-between text-[11px] text-[#6b7280] tabular-nums">
          <div className="flex items-center gap-2">
            <span>{charCount} অক্ষর</span>
            <span aria-hidden="true">·</span>
            <span>{wordCount} শব্দ</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6b7280]">
            <span>বাংলা ও ইংরেজি ইউনিকোড সমর্থিত</span>
          </div>
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-[#6b7280]">{helperText}</p>
      )}

      {/* Editor Styles */}
      <style>{`
        .rich-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-editor-content h2, .rich-description-preview h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin-top: 0.75rem;
          margin-bottom: 0.35rem;
        }
        .rich-editor-content h3, .rich-description-preview h3 {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .rich-editor-content p, .rich-description-preview p {
          margin-bottom: 0.45rem;
          line-height: 1.7;
        }
        .rich-editor-content ul, .rich-description-preview ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .rich-editor-content ol, .rich-description-preview ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .rich-editor-content li, .rich-description-preview li {
          margin-bottom: 0.2rem;
          line-height: 1.65;
        }
        .rich-editor-content blockquote, .rich-description-preview blockquote {
          border-left: 2px solid #881337;
          padding-left: 0.75rem;
          color: #374151;
          font-style: italic;
          margin: 0.5rem 0;
          background-color: #faf9f7;
          padding-top: 0.3rem;
          padding-bottom: 0.3rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
      `}</style>
    </div>
  );
};
