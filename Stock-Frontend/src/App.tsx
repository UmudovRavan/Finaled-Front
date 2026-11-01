import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, LanguageProvider, AuthProvider, StockEntryProvider } from './context';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <StockEntryProvider>
              <AppRoutes />
            </StockEntryProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

