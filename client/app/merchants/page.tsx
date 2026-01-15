'use client';

import Link from 'next/link';
import { mockMerchants } from '@/app/lib/merchants';

export default function MerchantDashboard() {
  return (
    <div className="min-h-screen bg-merchant">
      {/* Header */}
      <header className="pt-8 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏪</span>
            <h1 className="text-4xl font-extrabold text-foreground">
              Merchant Dashboard
            </h1>
          </div>
          <p className="text-gray-500">
            Select your business to manage stamp cards and view analytics
          </p>
        </div>
      </header>

      {/* Merchants Grid */}
      <main className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMerchants.map((merchant, index) => (
              <Link key={merchant.id} href={`/merchants/${merchant.id}`}>
                <div 
                  className="merchant-card p-6 cursor-pointer stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Merchant Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                      style={{ backgroundColor: `${merchant.color}20` }}
                    >
                      {merchant.icon}
                    </div>
                    <div className="merchant-badge">
                      {merchant.totalStampsRequired} stamps
                    </div>
                  </div>
                  
                  {/* Merchant Info */}
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {merchant.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {merchant.description}
                  </p>
                  
                  {/* Card Program Info */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Stamp Card Program
                    </p>
                    <p className="text-sm font-semibold text-secondary">
                      {merchant.stampCardName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      🎁 {merchant.rewardDescription}
                    </p>
                  </div>

                  {/* Action hint */}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-primary font-semibold">
                      Manage →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Back to user view */}
      <Link href="/">
        <button className="fixed bottom-8 right-8 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:scale-105 transition-all">
          <span>👤</span>
          <span className="font-semibold">User View</span>
        </button>
      </Link>
    </div>
  );
}
