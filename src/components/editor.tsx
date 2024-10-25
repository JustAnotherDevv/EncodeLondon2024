import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileType } from "@/types/file";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

interface EditorProps {
  files: FileType[];
  activeFile: string;
  onFileChange: (fileId: string, content: string) => void;
  onFileClose: (fileId: string) => void;
  onFileSelect: (fileId: string) => void;
}

export function CodeEditor({
  files,
  activeFile,
  onFileChange,
  onFileClose,
  onFileSelect,
}: EditorProps) {
  useEffect(() => {
    const componentInit = async () => {};

    componentInit();
  }, []);

  const handleSave = () => {
    toast.success("File saved successfully!");
  };

  return (
    <Card className="relative h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between border-b p-2">
        <Tabs
          value={activeFile}
          className="w-full"
          onValueChange={onFileSelect}
        >
          <TabsList className="w-full justify-start">
            {files.map((file) => (
              <div key={file.id} className="flex items-center">
                <TabsTrigger
                  value={file.id}
                  className="flex items-center gap-2"
                >
                  {file.name}
                </TabsTrigger>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileClose(file.id);
                  }}
                  className="ml-1 cursor-pointer rounded-sm p-1 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </span>
              </div>
            ))}
          </TabsList>
          {files.map((file) => (
            <TabsContent
              key={file.id}
              value={file.id}
              className="h-[calc(100vh-14rem)]"
            >
              <Editor
                height="100%"
                defaultLanguage={file.language}
                value={file.content}
                onChange={(value) => onFileChange(file.id, value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
        <Button onClick={handleSave} size="sm" className="ml-2">
          Save
        </Button>
      </div>
    </Card>
  );
}
