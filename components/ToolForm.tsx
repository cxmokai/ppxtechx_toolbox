import React, { useState, useEffect, useRef } from 'react';
import { WebTool, ToolFormData } from '../types';
import { Button, Input, Label, Badge, Dialog } from './UI';
import { X, Plus, Tag } from 'lucide-react';

interface ToolFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ToolFormData) => void;
  initialData?: WebTool | null;
  allExistingTags: string[];
}

const ToolForm: React.FC<ToolFormProps> = ({ isOpen, onClose, onSubmit, initialData, allExistingTags }) => {
  const [formData, setFormData] = useState<ToolFormData>({
    title: '',
    url: '',
    tags: [],
    note: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        url: initialData.url,
        tags: initialData.tags,
        note: initialData.note
      });
    } else {
      setFormData({
        title: '',
        url: '',
        tags: [],
        note: ''
      });
    }
    setTagInput('');
    setIsDropdownOpen(false);
  }, [initialData, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  // Filter available tags: match input, exclude already selected
  const filteredTags = allExistingTags.filter(t => 
    !formData.tags.includes(t) && 
    t.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} title={initialData ? "编辑工具" : "添加新工具"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>标题</Label>
          <Input 
            required
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="例如: Google Gemini"
          />
        </div>
        
        <div className="space-y-2">
          <Label>网址 URL</Label>
          <Input 
            required
            type="url"
            value={formData.url} 
            onChange={e => setFormData({...formData, url: e.target.value})} 
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>标签</Label>
          
          {/* Selected Tags Area */}
          <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 rounded-md border border-stone-100 bg-stone-50/50">
            {formData.tags.length === 0 && (
              <span className="text-xs text-muted-foreground self-center">暂无标签</span>
            )}
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="pr-1 gap-1 bg-white border-stone-200 hover:bg-white shadow-sm">
                {tag}
                <X size={12} className="cursor-pointer text-stone-400 hover:text-red-500 transition-colors" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>

          {/* Tag Selection / Input */}
          <div className="relative" ref={wrapperRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  ref={inputRef}
                  value={tagInput}
                  onChange={e => {
                    setTagInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="选择标签或输入新标签..."
                  className="pl-9"
                />
              </div>
              <Button 
                type="button" 
                size="icon" 
                variant="secondary" 
                onClick={() => addTag(tagInput)} 
                disabled={!tagInput.trim()}
                title="添加标签"
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                
                {/* Existing Tags List */}
                {filteredTags.length > 0 && (
                  <div className="p-1">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                      现有标签
                    </div>
                    {filteredTags.map(tag => (
                      <div 
                        key={tag}
                        className="px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center justify-between group"
                        onClick={() => addTag(tag)}
                      >
                        <span>{tag}</span>
                        <Plus size={14} className="opacity-0 group-hover:opacity-100 text-rose-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Create New Tag Option */}
                {tagInput.trim() && !formData.tags.includes(tagInput.trim()) && !filteredTags.some(t => t.toLowerCase() === tagInput.trim().toLowerCase()) && (
                  <div className="p-1 border-t border-stone-100">
                     <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                      创建
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-rose-50 text-rose-700 font-medium flex items-center"
                      onClick={() => addTag(tagInput)}
                    >
                       <Plus size={14} className="mr-2" /> 
                       创建 "{tagInput}"
                    </div>
                  </div>
                )}

                {/* No Matches / Empty */}
                {!tagInput.trim() && filteredTags.length === 0 && (
                  <div className="p-4 text-center text-sm text-stone-400">
                     输入以创建新标签
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>备注 (可选)</Label>
          <Input 
            value={formData.note} 
            onChange={e => setFormData({...formData, note: e.target.value})} 
            placeholder="简短的描述..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={onClose}>取消</Button>
          <Button type="submit">{initialData ? "更新" : "创建"}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ToolForm;