import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">LogiRoute Optimizer</h1>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-6">
        <Dashboard />
      </main>
    </div>
  );
}

export default App