import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './components/theme-provider';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
