import { ThemeProvider } from "@/components/theme-provider";
import { Routes } from "@/components/routes";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="code-editor-theme">
      <Router>
        <Routes />
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
