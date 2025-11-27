import React, { useState, useEffect } from 'react';
import { WebTool, ToolFormData } from '../types';
import { Button, Input, Label, Badge, Dialog } from './UI';
import { X, Plus } from 'lucide-react';

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
  }, [initialData, isOpen]);

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
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const suggestedTags = allExistingTags.filter(t => 
    !formData.tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  ).slice(0, 8); // Limit suggestions

  return (
    <Dialog open={isOpen} onClose={onClose} title={initialData ? "编辑工具" : "添加新工具"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>标题</Label>
          <Input 
            required
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="例如: Google Gemnini"
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
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="pr-1 gap-1">
                {tag}
                <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="输入标签并回车..."
            />
            <Button type="button" size="sm" variant="secondary" onClick={() => addTag(tagInput)} disabled={!tagInput.trim()}>
              <Plus size={16} />
            </Button>
          </div>
          
          {/* Quick select existing tags */}
          {allExistingTags.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-muted-foreground mr-2">推荐标签:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {suggestedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {suggestedTags.length === 0 && allExistingTags.length > 0 && tagInput === '' && (
                   allExistingTags.filter(t => !formData.tags.includes(t)).slice(0,5).map(tag => (
                    <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Badge>
                   ))
                )}
              </div>
            </div>
          )}
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