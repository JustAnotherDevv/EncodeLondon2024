import { useEffect, useState } from "react";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SecurityIssue } from "@/types/file";
import { cn } from "@/lib/utils";

interface SecurityPanelProps {
  issues: SecurityIssue[];
  onIssueClick: (issue: SecurityIssue) => void;
}

export function SecurityPanel({ issues, onIssueClick }: SecurityPanelProps) {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>();

  useEffect(() => {
    const componentInit = async () => {
      // todo - init code scanner
      // todo - deploy contract to backend anvil network
      // todo - run scan
      const detectedVuls = [];
      setVulnerabilities(detectedVuls);
    };

    componentInit();
  }, []);

  const getSeverityIcon = (severity: SecurityIssue["severity"]) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">Security Issues</h2>
        <span className="text-sm text-muted-foreground">
          {issues.length} {issues.length === 1 ? "issue" : "issues"} found
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onIssueClick(issue)}
              className="flex w-full items-start space-x-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/50"
            >
              {getSeverityIcon(issue.severity)}
              <div className="flex flex-col items-start">
                <span>{issue.message}</span>
                <span className="text-xs text-muted-foreground">
                  {issue.file}
                  {issue.line && `:${issue.line}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
