import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  ThemeProvider,
  LanguageProvider,
  AuthProvider,
  StockEntryProvider,
  PurchaseReceiptProvider,
} from './context';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <StockEntryProvider>
              <PurchaseReceiptProvider>
                <AppRoutes />
              </PurchaseReceiptProvider>
            </StockEntryProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

