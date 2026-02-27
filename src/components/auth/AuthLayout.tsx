import React from 'react';

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
          <div className="inline-block mb-4">
            <img
              src="/logo.jpg"
              alt="The Quiverfull School"
              className="w-24 h-24 rounded-full object-cover shadow-lg mx-auto ring-4 ring-orange-200"
            />
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