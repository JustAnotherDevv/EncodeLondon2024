import { FileCode, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: 'files' | 'security';
  onTabChange: (tab: 'files' | 'security') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="border-b bg-muted/40 p-2">
      <nav className="flex space-x-2">
        <div
          role="tab"
          tabIndex={0}
          className={cn(
            'flex cursor-pointer items-center space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted',
            activeTab === 'files' && 'bg-muted text-foreground'
          )}
          onClick={() => onTabChange('files')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onTabChange('files');
            }
          }}
        >
          <FileCode className="h-4 w-4" />
          <span>Files</span>
        </div>
        <div
          role="tab"
          tabIndex={0}
          className={cn(
            'flex cursor-pointer items-center space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted',
            activeTab === 'security' && 'bg-muted text-foreground'
          )}
          onClick={() => onTabChange('security')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onTabChange('security');
            }
          }}
        >
          <Shield className="h-4 w-4" />
          <span>Security</span>
        </div>
      </nav>
    </div>
  );
}