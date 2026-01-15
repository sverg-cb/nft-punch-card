'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMerchant, getMerchantUsers } from '@/app/lib/merchants';
import { QRCode } from '@/app/components/QRCode';
import { 
  MERCHANT_PUNCH_CARD_ADDRESS, 
  generateRandomItemIds 
} from '@/app/lib/contracts';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

export default function MerchantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const merchant = getMerchant(id);
  const users = getMerchantUsers(id);
  
  const [showQRCode, setShowQRCode] = useState(false);

  // Get MiniKit context for Farcaster mini app info
  const { context } = useMiniKit();
  
  // Wallet connection
  const { isConnected } = useAccount();

  // Generate random item IDs for the purchase QR code
  // Memoized so it stays consistent while the QR is displayed
  const purchaseItemIds = useMemo(() => {
    if (showQRCode) {
      return generateRandomItemIds();
    }
    return [];
  }, [showQRCode]);

  // Create the QR code value - JSON with purchase details
  const qrCodeValue = useMemo(() => {
    if (!showQRCode || purchaseItemIds.length === 0) return '';
    return JSON.stringify({
      action: 'processPurchase',
      contract: MERCHANT_PUNCH_CARD_ADDRESS,
      itemIds: purchaseItemIds.map(id => id.toString()),
      merchantId: id,
    });
  }, [showQRCode, purchaseItemIds, id]);

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

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isRedeemed).length;
  const completedRewards = users.filter(u => u.isRedeemed).length;
  const totalStampsIssued = users.reduce((sum, u) => sum + u.currentStamps, 0);

  return (
    <div className="min-h-screen bg-merchant">
      {/* Header */}
      <header className="pt-8 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/merchants" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Merchants
            </Link>
            
            {/* Wallet Connection */}
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
          
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
              {context?.user && (
                <p className="text-sm text-primary mt-1">
                  Logged in as @{context.user.username || `fid:${context.user.fid}`}
                </p>
              )}
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

          {/* Generate Purchase QR Code Section */}
          <div className="merchant-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span>🎟️</span> Process Purchase
            </h2>

            <p className="text-gray-600 mb-4">
              Generate a QR code for the customer to scan. They will sign the transaction to record their purchase.
            </p>

            {!showQRCode ? (
              <button
                onClick={() => setShowQRCode(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <span>✨</span>
                Generate Purchase QR Code
              </button>
            ) : (
              <div className="text-center">
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 font-medium mb-2">
                    Customer scans this QR code to record their purchase
                  </p>
                  <p className="text-sm text-blue-600">
                    Items: [{purchaseItemIds.map(id => id.toString()).join(', ')}]
                  </p>
                </div>
                
                <div className="flex justify-center mb-4">
                  <QRCode 
                    value={qrCodeValue}
                    title="Customer: Scan to Record Purchase"
                    size={250}
                  />
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => {
                      setShowQRCode(false);
                      setTimeout(() => setShowQRCode(true), 100);
                    }}
                    className="px-6 py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    🔄 New Items
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center mt-4">
              The customer will call processPurchase on contract {MERCHANT_PUNCH_CARD_ADDRESS.slice(0, 10)}...
            </p>
          </div>

          {/* Customer Analytics */}
          <div className="merchant-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span>📊</span> Customer Analytics
            </h2>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>No customers yet. Start processing purchases!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                        Address
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">
                        Stamps
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr 
                        key={user.address}
                        className="border-b border-gray-100 stagger-item"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="py-3 px-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
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
                          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: `${(user.currentStamps / merchant.totalStampsRequired) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          {user.isRedeemed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              ✓ Redeemed
                            </span>
                          ) : user.currentStamps >= merchant.totalStampsRequired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                              🎉 Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
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
              <div className="md:col-span-2">
                <span className="text-gray-500">Contract:</span>
                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {MERCHANT_PUNCH_CARD_ADDRESS}
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
