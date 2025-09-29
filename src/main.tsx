import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css'; // dùng reset để tránh xung đột CSS
import './apps/index.css';
import App from './apps/App';
import { Provider } from 'react-redux';
import { store, persistor } from './services/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import ChatboxGemini from '@/components/ui/ChatboxGemini';


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(

  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
      <ChatboxGemini />
    </PersistGate>
  </Provider>

);