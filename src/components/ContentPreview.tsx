import { X, Copy, Download, Check, FileText, Share2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface ContentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  contentType: string;
  onSave?: () => void;
  onExport?: (format: 'markdown' | 'html' | 'text') => void;
}

export function ContentPreview({
  isOpen,
  onClose,
  title,
  content,
  contentType,
  onSave,
  onExport
}: ContentPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'preview' | 'markdown' | 'html'>('preview');

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'markdown' | 'html' | 'text') => {
    let exportContent = content;
    let filename = `${title.toLowerCase().replace(/\s+/g, '-')}`;
    let mimeType = 'text/plain';

    if (format === 'markdown') {
      filename += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'html') {
      exportContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a202c; margin-bottom: 20px; }
    p { margin-bottom: 16px; color: #4a5568; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content.split('\n\n').map(para => `<p>${para}</p>`).join('\n  ')}
</body>
</html>`;
      filename += '.html';
      mimeType = 'text/html';
    } else {
      filename += '.txt';
    }

    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    if (onExport) {
      onExport(format);
    }
  };

  const formatContent = () => {
    if (exportFormat === 'markdown') {
      return content;
    } else if (exportFormat === 'html') {
      return content.split('\n\n').map(para => `<p>${para}</p>`).join('\n');
    }
    return content;
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Content Preview</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {wordCount} words · {charCount} characters · {readingTime} min read
              </p>
            </div>

            {/* Format Tabs */}
            <div className="flex items-center space-x-2 mr-4">
              <button
                onClick={() => setExportFormat('preview')}
                className={clsx(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  exportFormat === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                Preview
              </button>
              <button
                onClick={() => setExportFormat('markdown')}
                className={clsx(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  exportFormat === 'markdown'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                Markdown
              </button>
              <button
                onClick={() => setExportFormat('html')}
                className={clsx(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  exportFormat === 'html'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                HTML
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-white"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
              {exportFormat === 'preview' ? (
                <div className="prose prose-slate max-w-none">
                  {content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {formatContent()}
                </pre>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExport('markdown')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Markdown</span>
                </button>

                <button
                  onClick={() => handleExport('html')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>HTML</span>
                </button>

                <button
                  onClick={() => handleExport('text')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Text</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
                {onSave && (
                  <button
                    onClick={() => {
                      onSave();
                      onClose();
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Content</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
