export interface FileType {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface SecurityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  line?: number;
  column?: number;
  file: string;
}