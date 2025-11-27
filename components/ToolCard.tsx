import React from 'react';
import { WebTool } from '../types';
import { ExternalLink, Trash2, Edit2, Eye } from 'lucide-react';
import { Badge, Button } from './UI';

interface ToolCardProps {
  tool: WebTool;
  onVisit: (tool: WebTool) => void;
  onEdit: (tool: WebTool) => void;
  onDelete: (id: string) => void;
  compact?: boolean; // For top tools view
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onVisit, onEdit, onDelete, compact = false }) => {
  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    onVisit(tool);
    window.open(tool.url, '_blank');
  };

  if (compact) {
    return (
      <div 
        onClick={handleVisit}
        className="group relative flex flex-col justify-between p-4 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
      >
        <div>
          <h3 className="font-semibold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1">{tool.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Eye size={12} /> {tool.visits} 次访问
          </p>
        </div>
        <div className="mt-3 flex gap-1 flex-wrap">
          {tool.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 mr-2">
          <div className="flex items-center gap-2">
            <h3 
              onClick={handleVisit}
              className="font-bold text-lg text-stone-900 hover:text-rose-600 cursor-pointer transition-colors"
            >
              {tool.title}
            </h3>
            <ExternalLink size={14} className="text-stone-400 group-hover:text-rose-400" />
          </div>
          <a 
            href={tool.url} 
            onClick={handleVisit}
            className="text-xs text-stone-400 hover:underline truncate block max-w-[200px] mt-0.5"
          >
            {tool.url}
          </a>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-500 hover:text-stone-900" onClick={() => onEdit(tool)}>
            <Edit2 size={14} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-500 hover:text-red-600" onClick={() => onDelete(tool.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {tool.note && (
          <p className="text-sm text-stone-600 mt-2 mb-3 line-clamp-2">{tool.note}</p>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-stone-100 text-stone-600 hover:bg-stone-200">
              {tag}
            </Badge>
          ))}
          {tool.tags.length === 0 && <span className="text-xs text-stone-300 italic">无标签</span>}
        </div>
        <div className="text-xs text-stone-400 font-medium whitespace-nowrap ml-2 flex items-center gap-1">
           {tool.visits} <span className="text-[10px]">VISITS</span>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;