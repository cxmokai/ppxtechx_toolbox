import React, { useState, useEffect, useMemo } from 'react';
import { WebTool, ToolFormData, CategoryGroup } from './types';
import { loadTools, saveTools, exportData, importData } from './services/storage';
import ToolForm from './components/ToolForm';
import ToolCard from './components/ToolCard';
import { Button, Input } from './components/UI';
import { Plus, Search, Upload, Download, Wrench, Menu, X, Github } from 'lucide-react';

const App: React.FC = () => {
  const [tools, setTools] = useState<WebTool[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<WebTool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loaded = loadTools();
    setTools(loaded);
  }, []);

  // Save on changes
  useEffect(() => {
    saveTools(tools);
  }, [tools]);

  // Derived state: Unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tools.forEach(tool => tool.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tools]);

  // Derived state: Top Tools (Most visited)
  const topTools = useMemo(() => {
    return [...tools].sort((a, b) => b.visits - a.visits).slice(0, 4);
  }, [tools]);

  // Derived state: Grouped by Category + Search filter
  const groupedTools = useMemo(() => {
    const filtered = tools.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (searchQuery) {
      // If searching, just show a single "Search Results" group
      return [{ tag: '搜索结果', tools: filtered }];
    }

    const groups: CategoryGroup[] = [];
    
    // Group by tags
    allTags.forEach(tag => {
      const toolsInTag = filtered.filter(t => t.tags.includes(tag));
      if (toolsInTag.length > 0) {
        groups.push({ tag, tools: toolsInTag });
      }
    });

    // Handle tools with NO tags
    const noTagTools = filtered.filter(t => t.tags.length === 0);
    if (noTagTools.length > 0) {
      groups.push({ tag: '未分类', tools: noTagTools });
    }

    return groups;
  }, [tools, allTags, searchQuery]);

  // Actions
  const handleCreate = (data: ToolFormData) => {
    const newTool: WebTool = {
      ...data,
      id: crypto.randomUUID(),
      visits: 0,
      createdAt: Date.now()
    };
    setTools(prev => [newTool, ...prev]);
  };

  const handleUpdate = (data: ToolFormData) => {
    if (!editingTool) return;
    setTools(prev => prev.map(t => t.id === editingTool.id ? { ...t, ...data } : t));
    setEditingTool(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个工具吗?')) {
      setTools(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleVisit = (tool: WebTool) => {
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, visits: t.visits + 1 } : t));
  };

  const handleExport = () => {
    exportData(tools);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importData(file);
      if (window.confirm(`确定要导入 ${imported.length} 个工具吗? 这将覆盖当前数据。`)) {
        setTools(imported);
      }
    } catch (err) {
      alert('导入失败: 文件格式错误');
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-rose-600 p-1.5 rounded-lg">
              <Wrench className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 hidden sm:block">
              PPXTechX <span className="text-rose-600">Toolbox</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
              <Input 
                className="pl-9 bg-stone-100 border-transparent focus:bg-white transition-all" 
                placeholder="搜索工具..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-6 w-px bg-stone-200 mx-1"></div>
            <input
              type="file"
              id="import-file"
              className="hidden"
              accept=".json"
              onChange={handleImport}
            />
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
              <Upload className="mr-2 h-4 w-4" /> 导入
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> 导出
            </Button>
            <Button onClick={() => { setEditingTool(null); setIsModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> 新建工具
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Search & Menu */}
        {isMobileMenuOpen && (
           <div className="md:hidden border-t px-4 py-4 space-y-4 bg-white animate-in slide-in-from-top-2">
             <Input 
                className="bg-stone-100" 
                placeholder="搜索工具..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={() => { setEditingTool(null); setIsModalOpen(true); setIsMobileMenuOpen(false); }}>
                  <Plus className="mr-2 h-4 w-4" /> 新建工具
                </Button>
                <div className="grid grid-cols-2 gap-2">
                   <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> 导入
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> 导出
                  </Button>
                </div>
              </div>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-10">
        
        {/* Top Tools Section (Only show if not searching and has tools) */}
        {!searchQuery && tools.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-stone-800">常用工具</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Top 4</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topTools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  onVisit={handleVisit} 
                  onEdit={() => {}} 
                  onDelete={() => {}}
                  compact={true}
                />
              ))}
              {topTools.length === 0 && (
                <div className="col-span-full py-8 text-center text-stone-400 bg-white rounded-xl border border-dashed border-stone-200">
                  暂无访问记录，快去使用你的工具吧！
                </div>
              )}
            </div>
          </section>
        )}

        {/* Category Sections */}
        <div className="space-y-8">
          {groupedTools.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-stone-100 inline-flex p-4 rounded-full mb-4">
                <Wrench className="h-8 w-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-900">还没有工具</h3>
              <p className="text-stone-500 mt-2 max-w-sm mx-auto">
                点击右上角的"新建工具"按钮开始添加你的第一个常用网址。
              </p>
            </div>
          ) : (
            groupedTools.map(group => (
              <section key={group.tag} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4 sticky top-16 bg-stone-50/95 backdrop-blur py-2 z-10">
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
                    {group.tag}
                  </h2>
                  <span className="text-sm text-stone-400 font-mono">({group.tools.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {group.tools.map(tool => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onVisit={handleVisit}
                      onEdit={(t) => { setEditingTool(t); setIsModalOpen(true); }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-stone-200 mt-auto bg-white">
        <div className="container mx-auto px-4 text-center text-stone-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PPXTechX Toolbox. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      <ToolForm 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTool(null); }}
        onSubmit={editingTool ? handleUpdate : handleCreate}
        initialData={editingTool}
        allExistingTags={allTags}
      />
    </div>
  );
};

export default App;