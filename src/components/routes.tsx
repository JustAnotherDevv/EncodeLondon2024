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
import { useLocation } from "react-router-dom";
import InsuranceDashboard from "./insurance-dashboard";

const initialFiles: FileType[] = [
  {
    id: "1",
    name: "contract.cairo",
    content: `
let my_str = "hello";
    `,
    language: "rust",
  },
];

export function Routes() {
  const location = useLocation();
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [activeFile, setActiveFile] = useState(initialFiles[0].id);
  const [activeTab, setActiveTab] = useState<"files" | "security">("files");
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [fileAmount, setFileAmount] = useState<number>(1);

  const analyzeCode = (code: string, fileId: string) => {
    // todo
    // setSecurityIssues(newIssues);
  };

  const handleFileChange = (fileId: string, content: string) => {
    setFiles(files.map((f) => (f.id === fileId ? { ...f, content } : f)));
    analyzeCode(content, fileId);
  };

  const handleNewFile = () => {
    const newFile: FileType = {
      id: nanoid(),
      // name: `untitled-${files.length + 1}.js`,
      name: `contract-${fileAmount}.cairo`,
      content: "",
      language: "rust",
    };
    setFiles([...files, newFile]);
    setActiveFile(newFile.id);
    setFileAmount(fileAmount + 1);
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

  if (location.pathname === "/insurance") {
    return (
      <div className="flex h-screen flex-col bg-background">
        <Header />
        <InsuranceDashboard />
      </div>
    );
  }

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
