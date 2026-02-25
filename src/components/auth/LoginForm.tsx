import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export default function LoginForm({ onSuccess, onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Demo Accounts Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">🎯 Demo Accounts</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <div className="bg-white p-2 rounded border">
            <p><strong>Admin:</strong> admin@quiverfullschool.ng</p>
            <p><strong>Password:</strong> Admin123!</p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p><strong>Teacher:</strong> teacher@quiverfullschool.ng</p>
            <p><strong>Password:</strong> Teacher123!</p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p><strong>Parent:</strong> parent@quiverfullschool.ng</p>
            <p><strong>Password:</strong> Parent123!</p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p><strong>Student:</strong> student@quiverfullschool.ng</p>
            <p><strong>Password:</strong> Student123!</p>
          </div>
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p><strong>Note:</strong> If login fails, you need to set up Supabase with these demo accounts first.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Sign In
          </>
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Don't have an account? Register here
        </button>
      </div>
    </form>
  );
}