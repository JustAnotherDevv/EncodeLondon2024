import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileType } from '@/types/file';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: FileType[];
  activeFile: string;
  onFileSelect: (fileId: string) => void;
  onNewFile: () => void;
}

export function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onNewFile,
}: FileExplorerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">Files</h2>
        <Button variant="ghost" size="sm" onClick={onNewFile}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={cn(
                'flex w-full cursor-pointer items-center space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/50',
                activeFile === file.id && 'bg-muted'
              )}
            >
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}