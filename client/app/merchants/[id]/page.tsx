'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMerchant, getMerchantUsers, formatAddress } from '@/app/lib/merchants';
import { QRScanner } from '@/app/components/QRScanner';

export default function MerchantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const merchant = getMerchant(id);
  const users = getMerchantUsers(id);
  
  const [stampCount, setStampCount] = useState(1);
  const [customerAddress, setCustomerAddress] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!merchant) {
    return (
      <div className="min-h-screen bg-merchant flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Merchant not found</h1>
          <Link href="/merchants" className="text-primary hover:underline">
            ← Back to merchants
          </Link>
        </div>
      </div>
    );
  }

  const handleScan = (address: string) => {
    setCustomerAddress(address);
    setIsScannerOpen(false);
  };

  const handleSubmit = () => {
    if (!customerAddress) {
      return;
    }
    
    // MVP: Just show success message
    // Later: Call smart contract to grant stamps
    setSuccessMessage(`Successfully granted ${stampCount} stamp${stampCount > 1 ? 's' : ''} to ${formatAddress(customerAddress)}`);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
      setCustomerAddress('');
      setStampCount(1);
    }, 3000);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isRedeemed).length;
  const completedRewards = users.filter(u => u.isRedeemed).length;
  const totalStampsIssued = users.reduce((sum, u) => sum + u.currentStamps, 0);

  return (
    <div className="min-h-screen bg-merchant">
      {/* Header */}
      <header className="pt-8 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/merchants" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Merchants
          </Link>
          
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: `${merchant.color}20` }}
            >
              {merchant.icon}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">
                {merchant.name}
              </h1>
              <p className="text-gray-500">{merchant.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="text-3xl font-bold text-primary">{totalUsers}</div>
              <div className="text-sm text-gray-500">Total Customers</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-secondary">{activeUsers}</div>
              <div className="text-sm text-gray-500">Active Cards</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-accent">{completedRewards}</div>
              <div className="text-sm text-gray-500">Rewards Redeemed</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-success">{totalStampsIssued}</div>
              <div className="text-sm text-gray-500">Stamps Issued</div>
            </div>
          </div>

          {/* Grant Stamps Section */}
          <div className="merchant-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span>🎟️</span> Grant Stamps
            </h2>
            
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300 flex items-center gap-2">
                <span className="text-xl">✅</span>
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              {/* Stamp Count Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Number of Stamps to Grant
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStampCount(Math.max(1, stampCount - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={stampCount}
                    onChange={(e) => setStampCount(Math.max(1, Math.min(merchant.totalStampsRequired, parseInt(e.target.value) || 1)))}
                    className="w-20 h-12 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:border-primary focus:outline-none"
                    min="1"
                    max={merchant.totalStampsRequired}
                  />
                  <button
                    onClick={() => setStampCount(Math.min(merchant.totalStampsRequired, stampCount + 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-2">
                    (max: {merchant.totalStampsRequired})
                  </span>
                </div>
              </div>

              {/* Customer Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Customer Wallet Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="0x... or scan QR code"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2"
                  >
                    <span>📷</span>
                    Scan
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!customerAddress}
                className={`btn-primary w-full flex items-center justify-center gap-2 ${
                  !customerAddress ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>✨</span>
                Grant {stampCount} Stamp{stampCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="merchant-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span>📊</span> Customer Analytics
            </h2>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>No customers yet. Start granting stamps!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Address
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Stamps
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr 
                        key={user.address}
                        className="border-b border-gray-100 dark:border-gray-800 stagger-item"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="py-3 px-2">
                          <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {user.displayAddress}
                          </code>
                        </td>
                        <td className="text-center py-3 px-2">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold text-primary">{user.currentStamps}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-500">{merchant.totalStampsRequired}</span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: `${(user.currentStamps / merchant.totalStampsRequired) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          {user.isRedeemed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              ✓ Redeemed
                            </span>
                          ) : user.currentStamps >= merchant.totalStampsRequired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                              🎉 Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              ⏳ Collecting
                            </span>
                          )}
                        </td>
                        <td className="text-right py-3 px-2 text-sm text-gray-500">
                          {user.lastVisit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Program Info */}
          <div className="merchant-card p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span>ℹ️</span> Program Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Card Name:</span>
                <span className="ml-2 font-semibold text-foreground">{merchant.stampCardName}</span>
              </div>
              <div>
                <span className="text-gray-500">Stamps Required:</span>
                <span className="ml-2 font-semibold text-foreground">{merchant.totalStampsRequired}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500">Reward:</span>
                <span className="ml-2 font-semibold text-foreground">{merchant.rewardDescription}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <QRScanner 
          onScan={handleScan} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}
    </div>
  );
}
