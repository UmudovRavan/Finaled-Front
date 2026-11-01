import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import stockLogo from '../assets/Stock-Logo.svg';
import { useAuth } from '../context';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      accessToken: 'demo-token-' + Date.now(),
      user: {
        email: email || 'admin@altensor.com',
        name: email ? email.split('@')[0] : 'Admin User',
        roles: ['Admin'],
        modules: ['stock'],
      },
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F19]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 mb-4 shadow-lg">
            <img src={stockLogo} alt="Altensor Stock" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Altensor Stock Portalına Giriş
          </h1>
          <p className="text-xs text-slate-500 mt-1">Anbar və stok idarəetmə kabineti</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-poçt
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@altensor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Şifrə
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
          >
            <span>Daxil ol</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

