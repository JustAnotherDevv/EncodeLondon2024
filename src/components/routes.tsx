import { useState } from "react";
import { nanoid } from "nanoid";
import { CodeEditor } from "@/components/editor";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { FileExplorer } from "@/components/file-explorer";
import { SecurityPanel } from "@/components/security-panel";
import { FileType, SecurityIssue } from "@/types/file";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const initialFiles: FileType[] = [
  {
    id: "1",
    name: "index.js",
    content: "// ToDo",
    language: "rust",
  },
];

export function Routes() {
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [activeFile, setActiveFile] = useState(initialFiles[0].id);
  const [activeTab, setActiveTab] = useState<"files" | "security">("files");
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);

  const analyzeCode = (code: string, fileId: string) => {
    const newIssues: SecurityIssue[] = [];
    const file = files.find((f) => f.id === fileId);

    if (!file) return;

    const lines = code.split("\n");
    lines.forEach((line, index) => {
      if (line.includes("eval(")) {
        newIssues.push({
          id: nanoid(),
          severity: "high",
          message:
            "Dangerous eval() detected - potential code injection vulnerability",
          line: index + 1,
          file: file.name,
        });
      }
      if (line.includes("innerHTML")) {
        newIssues.push({
          id: nanoid(),
          severity: "medium",
          message: "Use of innerHTML - potential XSS vulnerability",
          line: index + 1,
          file: file.name,
        });
      }
      if (line.match(/password.*=.*['"].*['"`]/)) {
        newIssues.push({
          id: nanoid(),
          severity: "high",
          message: "Hardcoded password detected",
          line: index + 1,
          file: file.name,
        });
      }
      if (line.includes("http://")) {
        newIssues.push({
          id: nanoid(),
          severity: "low",
          message: "Insecure HTTP protocol used - consider HTTPS",
          line: index + 1,
          file: file.name,
        });
      }
    });

    setSecurityIssues(newIssues);
  };

  const handleFileChange = (fileId: string, content: string) => {
    setFiles(files.map((f) => (f.id === fileId ? { ...f, content } : f)));
    analyzeCode(content, fileId);
  };

  const handleNewFile = () => {
    const newFile: FileType = {
      id: nanoid(),
      name: `untitled-${files.length + 1}.js`,
      content: "",
      language: "javascript",
    };
    setFiles([...files, newFile]);
    setActiveFile(newFile.id);
  };

  const handleFileClose = (fileId: string) => {
    if (files.length === 1) return;
    const newFiles = files.filter((f) => f.id !== fileId);
    setFiles(newFiles);
    if (activeFile === fileId) {
      setActiveFile(newFiles[0].id);
    }
  };

  const handleIssueClick = (issue: SecurityIssue) => {
    const file = files.find((f) => f.name === issue.file);
    if (file) {
      setActiveFile(file.id);
      // TODO: Highlight the specific line in the editor
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15}>
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === "files" ? (
              <FileExplorer
                files={files}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
                onNewFile={handleNewFile}
              />
            ) : (
              <SecurityPanel
                issues={securityIssues}
                onIssueClick={handleIssueClick}
              />
            )}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={80}>
            <main className="h-full p-6">
              <CodeEditor
                files={files}
                activeFile={activeFile}
                onFileChange={handleFileChange}
                onFileClose={handleFileClose}
                onFileSelect={setActiveFile}
              />
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
