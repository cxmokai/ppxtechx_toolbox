import { WebTool } from '../types';

const STORAGE_KEY = 'ppx_toolbox_data_v2';

const INITIAL_DATA: WebTool[] = [
  {
    id: 'init-1',
    title: 'Google Gemini',
    url: 'https://gemini.google.com',
    tags: ['AI', 'Google', '助手'],
    visits: 124,
    note: 'Google 最强大的多模态 AI 模型',
    createdAt: Date.now()
  },
  {
    id: 'init-2',
    title: 'GitHub',
    url: 'https://github.com',
    tags: ['开发', '代码', '工具'],
    visits: 89,
    note: '全球最大的代码托管平台',
    createdAt: Date.now()
  },
  {
    id: 'init-3',
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    tags: ['开发', 'CSS', '文档'],
    visits: 76,
    note: '原子化 CSS 框架文档',
    createdAt: Date.now()
  },
  {
    id: 'init-4',
    title: 'Figma',
    url: 'https://www.figma.com',
    tags: ['设计', 'UI/UX', '工具'],
    visits: 55,
    note: '在线界面设计协作工具',
    createdAt: Date.now()
  },
  {
    id: 'init-5',
    title: 'Vercel',
    url: 'https://vercel.com',
    tags: ['开发', '部署', 'Serverless'],
    visits: 42,
    note: '前端应用部署和托管平台',
    createdAt: Date.now()
  },
  {
    id: 'init-6',
    title: 'YouTube',
    url: 'https://youtube.com',
    tags: ['娱乐', '视频'],
    visits: 310,
    note: '视频分享和观看平台',
    createdAt: Date.now()
  },
  {
    id: 'init-7',
    title: 'Excalidraw',
    url: 'https://excalidraw.com',
    tags: ['工具', '绘图', '开源'],
    visits: 28,
    note: '手绘风格的虚拟白板',
    createdAt: Date.now()
  },
  {
    id: 'init-8',
    title: 'React',
    url: 'https://react.dev',
    tags: ['开发', '框架', '文档'],
    visits: 95,
    note: '用于构建 Web 和原生用户界面的库',
    createdAt: Date.now()
  },
  {
    id: 'init-9',
    title: 'Notion',
    url: 'https://www.notion.so',
    tags: ['工具', '笔记', '生产力'],
    visits: 150,
    note: '多合一笔记和协作工作区',
    createdAt: Date.now()
  }
];

export const loadTools = (): WebTool[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Return parsed data if it exists and is not empty, otherwise return INITIAL_DATA
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DATA;
    }
    return INITIAL_DATA;
  } catch (error) {
    console.error('Failed to load tools from storage', error);
    return INITIAL_DATA;
  }
};

export const saveTools = (tools: WebTool[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  } catch (error) {
    console.error('Failed to save tools to storage', error);
  }
};

export const exportData = (tools: WebTool[]) => {
  const dataStr = JSON.stringify(tools, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `ppx_toolbox_backup_${new Date().toISOString().slice(0, 10)}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importData = (file: File): Promise<WebTool[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          resolve(json);
        } else {
          reject(new Error('Invalid file format: Expected an array of tools.'));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};