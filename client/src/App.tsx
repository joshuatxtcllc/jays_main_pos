import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";
import PosSystem from "./pages/PosSystem";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import NotFound from "@/pages/not-found";
import { QueryErrorResetBoundary, ReactErrorBoundary, ErrorInfo } from 'react-error-boundary'; //added imports


function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved theme preference or use OS preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);

    if (!darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ReactErrorBoundary
          onReset={reset}
          FallbackComponent={ErrorFallback}
          onError={(error: Error, info: ErrorInfo) => {
            console.error("App error:", error);
            console.error("Component stack:", info.componentStack);
          }}
        >
          <QueryClientProvider client={queryClient}>
            <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
              <Header darkMode={darkMode} toggleTheme={toggleTheme} />
              <main className="container pt-24 pb-10">
                <Switch>
                  <Route path="/" component={PosSystem} />
                  <Route path="/orders" component={Orders} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
            <Toaster />
          </QueryClientProvider>
        </ReactErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default App;