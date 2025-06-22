import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { SocketProvider } from './Socket/SocketContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
        <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;