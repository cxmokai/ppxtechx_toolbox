export interface WebTool {
  id: string;
  title: string;
  url: string;
  tags: string[];
  visits: number;
  note: string;
  createdAt: number;
}

export type ToolFormData = Omit<WebTool, 'id' | 'visits' | 'createdAt'>;

export interface CategoryGroup {
  tag: string;
  tools: WebTool[];
}