import React from 'react';
import { User } from '../types';
import AdminLogin from './AdminLogin';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigateHome?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onNavigateHome = () => {} }) => {
  return <AdminLogin onLogin={onLogin} onNavigateHome={onNavigateHome} />;
};

export default Auth;
