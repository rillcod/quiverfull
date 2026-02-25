import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* School Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-yellow-200 absolute translate-x-2 -translate-y-2" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">The Quiverfull School</h1>
          <p className="text-gray-600 text-sm">Nurturing Young Minds with Excellence</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Proudly Nigerian • Montessori Excellence • Est. 2020
          </p>
        </div>
      </div>
    </div>
  );
}