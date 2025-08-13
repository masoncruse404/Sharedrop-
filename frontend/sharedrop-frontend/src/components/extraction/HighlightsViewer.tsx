import { useState } from 'react';
import { HighlightsData } from '../../types/extraction';
import { Button } from '../ui/button';
import { formatFileSize, formatDate } from '../../lib/utils';
import {
  Download,
  FileText,
  BarChart3,
  Hash,
  Quote,
  TrendingUp,
  Copy,
  Check
} from 'lucide-react';

interface HighlightsViewerProps {
  data: HighlightsData;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportEXCEL: () => void;
}

export const HighlightsViewer = ({ data, onExportCSV, onExportJSON, onExportEXCEL }: HighlightsViewerProps) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getFrequencyColor = (frequency: number, maxFrequency: number) => {
    const intensity = frequency / maxFrequency;
    if (intensity > 0.8) return 'bg-red-100 text-red-800';
    if (intensity > 0.6) return 'bg-orange-100 text-orange-800';
    if (intensity > 0.4) return 'bg-yellow-100 text-yellow-800';
    if (intensity > 0.2) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const maxKeywordFreq = Math.max(...data.top_keywords.map(k => k.frequency));
  const maxPhraseFreq = Math.max(...data.top_phrases.map(p => p.frequency));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Text Analysis Results</h3>
            <p className="text-sm text-gray-600">{data.filename}</p>
          </div>
        </div>
        <Button onClick={onExportJSON} variant="outline">
          <Download size={16} />
          Export JSON
        </Button>
         <Button onClick={onExportCSV} variant="outline">
          <Download size={16} />
          Export CSV
        </Button>
        <Button onClick={onExportEXCEL} variant="outline">
          <Download size={16} />
          Export EXCEL
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Characters</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {data.text_stats.total_characters.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">Words</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {data.text_stats.total_words.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Quote size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Sentences</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {data.text_stats.total_sentences.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Unique Words</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {data.text_stats.unique_words.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h4>
        <div className="space-y-2">
          {data.top_keywords.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <span className="font-medium text-gray-900">{keyword.word}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getFrequencyColor(keyword.frequency, maxKeywordFreq)
                }`}>
                  {keyword.frequency} times
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(keyword.word, `keyword-${index}`)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {copiedItem === `keyword-${index}` ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Phrases */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Phrases</h4>
        <div className="space-y-2">
          {data.top_phrases.map((phrase, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <span className="font-medium text-gray-900 truncate">{phrase.phrase}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  getFrequencyColor(phrase.frequency, maxPhraseFreq)
                }`}>
                  {phrase.frequency} times
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(phrase.phrase, `phrase-${index}`)}
                className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 ml-2"
              >
                {copiedItem === `phrase-${index}` ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Highlights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Sample Text Highlights</h4>
        <div className="space-y-3">
          {data.sample_highlights.map((highlight, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg relative group"
            >
              <p className="text-gray-800 leading-relaxed">{highlight}</p>
              <button
                onClick={() => copyToClipboard(highlight, `highlight-${index}`)}
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-blue-100 rounded transition-all"
              >
                {copiedItem === `highlight-${index}` ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-blue-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">File Type:</span>
            <span className="ml-2 text-gray-600">{data.file_type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">File Size:</span>
            <span className="ml-2 text-gray-600">{formatFileSize(data.file_size_bytes)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Extracted:</span>
            <span className="ml-2 text-gray-600">{formatDate(data.extracted_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
