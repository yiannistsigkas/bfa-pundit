import { Button } from '@/components/ui/button';
import { Download, Trash2, Database, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  hasData: boolean;
  onLoadSample: () => void;
  onClearData: () => void;
  onExport: () => void;
  isLoading: boolean;
}

export function Header({ hasData, onLoadSample, onClearData, onExport, isLoading }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Statement Pundit</h1>
            <p className="text-sm text-muted-foreground">
              Analyze financial ratios and valuation multiples
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSample}
              disabled={isLoading}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Load Sample</span>
            </Button>
            {hasData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearData}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
