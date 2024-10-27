import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, AlertCircle, CheckCircle, Loader2, Code, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileType {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface VulnerabilityType {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  line: number;
}

interface FuzzingResultType {
  functionName: string;
  result: string;
  status: "pass" | "fail";
  input: string;
}

interface EditorProps {
  files: FileType[];
  activeFile: string;
  onFileChange: (fileId: string, content: string) => void;
  onFileClose: (fileId: string) => void;
  onFileSelect: (fileId: string) => void;
}

interface CompilationResponse {
  success: boolean;
  error?: string;
  stderr?: string;
  sierra?: string;
  casm?: string;
  sierraCompilationOutput?: string;
  casmCompilationOutput?: string;
  functions?: string[];
  fuzzingResults?: FuzzingResultType[];
}

export function CodeEditor({
  files,
  activeFile,
  onFileChange,
  onFileClose,
  onFileSelect,
}: EditorProps) {
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityType[]>(
    []
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [detectedFunctions, setDetectedFunctions] = useState<string[]>([]);
  const [fuzzingResults, setFuzzingResults] = useState<FuzzingResultType[]>([]);

  const handleSave = () => {
    toast.success("File saved successfully!");
  };

  const handleCompile = async () => {
    const activeFileData = files.find((f) => f.id === activeFile);
    if (!activeFileData) return;

    setIsCompiling(true);
    setCompilationError(null);
    setVulnerabilities([]);
    setDetectedFunctions([]);
    setFuzzingResults([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/compile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: activeFileData.content,
            filename: activeFileData.name,
            runTime: 120,
          }),
        }
      );

      const data: CompilationResponse = await response.json();

      if (!data.success) {
        setCompilationError(data.error || data.stderr || "Compilation failed");
        toast.error("Compilation failed");
      } else {
        if (data.functions) {
          setDetectedFunctions(data.functions);
        }
        if (data.fuzzingResults) {
          setFuzzingResults(data.fuzzingResults);
        }
        const mockVulnerabilities: VulnerabilityType[] = [
          {
            severity: "high",
            title: "Reentrancy Risk",
            description: "Potential reentrancy vulnerability in external calls",
            line: 42,
          },
        ];
        setVulnerabilities(mockVulnerabilities);
        toast.success("Compilation successful");
      }
    } catch (error) {
      setCompilationError("Failed to connect to compilation service");
      toast.error("Failed to connect to compilation service");
    } finally {
      setIsCompiling(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="relative h-[calc(100vh-10rem)]">
      <Tabs value={activeFile} className="h-full" onValueChange={onFileSelect}>
        <div className="flex items-center justify-between border-b p-2">
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
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              Save
            </Button>
            <Button
              onClick={handleCompile}
              size="sm"
              disabled={isCompiling}
              className="w-24"
            >
              {isCompiling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting
                </>
              ) : (
                "Detect"
              )}
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-14rem)]">
          {files.map((file) => (
            <TabsContent key={file.id} value={file.id} className="h-full">
              <div className="flex h-full">
                <div className="w-1/2 border-r">
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
                </div>

                <div className="w-1/2 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Detected Functions
                      </h3>
                      {detectedFunctions.length > 0 ? (
                        <ul className="space-y-2">
                          {detectedFunctions.map((func, index) => (
                            <li key={index} className="p-2 bg-muted rounded-md">
                              {func}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            No functions detected yet.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Fuzzing Results
                      </h3>
                      {fuzzingResults.length > 0 ? (
                        <div className="space-y-3">
                          {fuzzingResults.map((result, index) => (
                            <Alert
                              key={index}
                              variant={
                                result.status === "pass"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              <AlertTitle>{result.functionName}</AlertTitle>
                              <AlertDescription>
                                <div>Input: {result.input}</div>
                                <div>Result: {result.result}</div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            No fuzzing results available.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Security Analysis
                      </h3>
                      {compilationError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Compilation Error</AlertTitle>
                          <AlertDescription className="whitespace-pre-wrap font-mono text-sm">
                            {compilationError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {!compilationError && vulnerabilities.length === 0 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>No Issues Detected</AlertTitle>
                          <AlertDescription>
                            No vulnerabilities found in the current analysis.
                          </AlertDescription>
                        </Alert>
                      )}

                      {vulnerabilities.length > 0 && (
                        <div className="space-y-4">
                          {vulnerabilities.map((vuln, index) => (
                            <Alert key={index} variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle
                                className={`flex items-center gap-2 ${getSeverityColor(
                                  vuln.severity
                                )}`}
                              >
                                {vuln.title}
                                <span className="text-sm font-normal">
                                  (Line {vuln.line})
                                </span>
                              </AlertTitle>
                              <AlertDescription>
                                {vuln.description}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Card>
  );
}

export default CodeEditor;
