import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AppRouter } from './routes';
import { AuthProvider, NotificationProvider, ThemeProvider, LanguageProvider } from './context';
import NotificationToast from './components/NotificationToast';
import BrandedLoader from './components/BrandedLoader';
import { ChatbotProvider } from './components/chatbot/ChatbotProvider';
import ChatbotTrigger from './components/chatbot/ChatbotTrigger';
import ChatWindow from './components/chatbot/ChatWindow';

// Initialize saved accent color on app startup
const savedAccent = localStorage.getItem('accent') || '#6366F1';
document.documentElement.style.setProperty('--color-primary', savedAccent);
document.documentElement.style.setProperty('--accent', savedAccent);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <BrandedLoader />
          <AuthProvider>
            <NotificationProvider>
              <ChatbotProvider>
                <AppRouter />
                <NotificationToast />
                <ChatWindow />
                <ChatbotTrigger />
              </ChatbotProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
