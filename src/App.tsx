import { ThemeProvider } from '@/components/theme-provider';
import { Routes } from '@/components/routes';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="code-editor-theme">
      <Routes />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;