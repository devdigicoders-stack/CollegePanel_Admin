import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    // Only connect if we have a token
    const token = localStorage.getItem('token');
    
    // We will parse the JWT payload to get the userId
    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    };
    
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.id) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Socket.io usually runs on the same base URL as the API
        const socketUrl = apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl;
        const newSocket = io(socketUrl, {
          withCredentials: true,
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          // Register user
          newSocket.emit('register', decoded.id);
        });

        newSocket.on('new_notification', (data) => {
          // Play a sound if you want, or just show a toast
          toast(data.message, {
            icon: '🔔',
            duration: 5000,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
          
          // Dispatch a custom event so UI components can update their counters
          window.dispatchEvent(new CustomEvent('live-notification', { detail: data }));
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      }
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
