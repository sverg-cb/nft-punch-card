'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { getStampCard } from '@/app/lib/stampCards';
import { QRScanner } from '@/app/components/QRScanner';
import { 
  MERCHANT_PUNCH_CARD_ADDRESS, 
  merchantPunchCardAbi 
} from '@/app/lib/contracts';

interface StampPageProps {
  params: { id: string };
}

interface PurchaseData {
  action: string;
  contract: string;
  itemIds: string[];
  merchantId: string;
}

// Max uint256 value used to represent empty slots in the contract
const EMPTY_SLOT = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export default function StampPage({ params }: StampPageProps) {
  const { id } = params;
  const card = getStampCard(id);
  
  // Get MiniKit context for Farcaster mini app info
  const { context } = useMiniKit();
  
  // Get wallet address - when in a mini app with autoConnect enabled,
  // this will automatically have the user's wallet address
  const { address, isConnected } = useAccount();

  // Read purchase history from contract
  const { 
    data: purchaseHistory, 
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useReadContract({
    address: MERCHANT_PUNCH_CARD_ADDRESS,
    abi: merchantPunchCardAbi,
    functionName: 'getPurchaseHistory',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Calculate stamp count from purchase history
  const onChainStampCount = useMemo(() => {
    if (!purchaseHistory) return 0;
    
    // Count non-empty slots (slots that are not max uint256)
    let count = 0;
    for (const itemId of purchaseHistory) {
      if (itemId !== EMPTY_SLOT && itemId !== BigInt(0)) {
        count++;
      }
    }
    return count;
  }, [purchaseHistory]);

  // Use on-chain stamp count if connected, otherwise fall back to mock data
  const currentStamps = isConnected && address ? onChainStampCount : (card?.currentStamps ?? 0);
  const totalStamps = card?.totalStamps ?? 10;
  const isComplete = currentStamps >= totalStamps;

  // Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<PurchaseData | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [scanError, setScanError] = useState('');

  // Contract write hook
  const { 
    writeContract, 
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash && pendingPurchase) {
      setSuccessMessage(
        `Purchase recorded! Items: [${pendingPurchase.itemIds.join(', ')}]`
      );
      
      // Refetch the purchase history to update stamp count
      refetchHistory();
      
      // Reset after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setPendingPurchase(null);
        resetWrite();
      }, 5000);
    }
  }, [isConfirmed, txHash, pendingPurchase, resetWrite, refetchHistory]);

  const handleScan = (data: string) => {
    setIsScannerOpen(false);
    setScanError('');
    
    try {
      const purchaseData: PurchaseData = JSON.parse(data);
      
      // Validate the scanned data
      if (purchaseData.action !== 'processPurchase') {
        setScanError('Invalid QR code - not a purchase request');
        return;
      }
      
      if (purchaseData.contract !== MERCHANT_PUNCH_CARD_ADDRESS) {
        setScanError('Invalid QR code - wrong contract address');
        return;
      }
      
      if (!purchaseData.itemIds || purchaseData.itemIds.length === 0) {
        setScanError('Invalid QR code - no items specified');
        return;
      }

      // Set pending purchase for confirmation
      setPendingPurchase(purchaseData);
    } catch {
      setScanError('Invalid QR code format');
    }
  };

  const handleConfirmPurchase = () => {
    if (!pendingPurchase || !isConnected) return;

    // Convert string item IDs to bigint
    const itemIds = pendingPurchase.itemIds.map(id => BigInt(id));

    // Call the smart contract - customer signs this transaction
    writeContract({
      address: MERCHANT_PUNCH_CARD_ADDRESS,
      abi: merchantPunchCardAbi,
      functionName: 'processPurchase',
      args: [itemIds],
    });
  };

  const handleCancelPurchase = () => {
    setPendingPurchase(null);
    setScanError('');
    resetWrite();
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-playful flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Card not found</h1>
        <p className="text-gray-500 mb-6">This stamp card doesn&apos;t exist.</p>
        <Link href="/" className="btn-secondary">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const isProcessing = isWritePending || isConfirming;
  const error = writeError || confirmError;

  return (
    <div className="min-h-screen bg-playful">
      {/* Back Button */}
      <div className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-secondary font-semibold hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cards
        </Link>
      </div>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-lg mx-auto">
          {/* Card Image Display */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 mb-8 text-center bounce-in">
            <div className="w-40 h-40 mx-auto mb-4 rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={card.image}
                alt={card.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">{card.name}</h1>
            <p className="text-lg text-gray-500">{card.merchantName}</p>
            
            {/* Show Farcaster user info if in mini app */}
            {context?.user && (
              <p className="text-sm text-primary mt-2">
                @{context.user.username || `fid:${context.user.fid}`}
              </p>
            )}
          </div>

          {/* Progress Section */}
          <div className="stamp-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
              <div className="flex items-center gap-2">
                {isLoadingHistory && isConnected && (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                )}
                <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {currentStamps}/{totalStamps}
                </span>
              </div>
            </div>

            {/* On-chain indicator */}
            {isConnected && address && (
              <div className="mb-4 text-xs text-gray-500 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Reading from contract
              </div>
            )}

            {/* Progress Bar */}
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${Math.min((currentStamps / totalStamps) * 100, 100)}%`,
                  background: card.isRedeemed 
                    ? 'linear-gradient(135deg, var(--success) 0%, #059669 100%)'
                    : isComplete 
                      ? 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                }}
              />
            </div>

            {/* Stamp Grid */}
            <div className="flex flex-wrap gap-3 justify-center">
              {Array.from({ length: totalStamps }).map((_, i) => (
                <div 
                  key={i}
                  className={`stamp ${i < currentStamps ? 'stamp-filled' : 'stamp-empty'} ${
                    i < currentStamps && !card.isRedeemed ? 'stamp-pulse' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {i < currentStamps ? '★' : (i + 1)}
                </div>
              ))}
            </div>
          </div>

          {/* Reward Info */}
          <div className="stamp-card p-6 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-2">🎁 Reward</h2>
            <p className="text-gray-600">{card.rewardDescription}</p>
          </div>

          {/* Conditional Bottom Section */}
          <div className="flex flex-col items-center">
            {card.isRedeemed ? (
              /* Redeemed State */
              <div className="text-center bounce-in">
                <div className="inline-flex items-center gap-2 bg-success/10 text-success px-6 py-4 rounded-2xl mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xl font-bold">Redeemed Rewards</span>
                </div>
                <p className="text-gray-500">
                  You&apos;ve already claimed your reward. Start collecting again!
                </p>
              </div>
            ) : isComplete ? (
              /* Complete - Ready to Redeem */
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Congratulations!
                </h3>
                <p className="text-gray-500 mb-6">
                  You&apos;ve collected all {totalStamps} stamps. Spin the wheel for your reward!
                </p>
                <Link href={`/rewards/${card.id}`} className="btn-primary inline-block">
                  🎰 Redeem Reward
                </Link>
              </div>
            ) : (
              /* In Progress - Scan to Record Purchase */
              <div className="text-center w-full">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Record Your Purchase
                </h3>

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-xl text-green-700 flex items-center justify-center gap-2">
                    <span className="text-xl">✅</span>
                    {successMessage}
                  </div>
                )}

                {/* Error Messages */}
                {(scanError || error) && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 flex items-center justify-center gap-2">
                    <span className="text-xl">❌</span>
                    <span className="break-all text-sm">
                      {scanError || (error instanceof Error ? error.message : 'Transaction failed')}
                    </span>
                  </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-xl text-blue-700 flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    {isWritePending ? 'Confirm in your wallet...' : 'Recording purchase...'}
                  </div>
                )}

                {/* Pending Purchase Confirmation */}
                {pendingPurchase && !isProcessing && !successMessage && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 font-medium mb-2">
                      Confirm Purchase
                    </p>
                    <p className="text-sm text-amber-700 mb-4">
                      Items to record: [{pendingPurchase.itemIds.join(', ')}]
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleCancelPurchase}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmPurchase}
                        disabled={!isConnected}
                        className={`px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors ${
                          !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isConnected ? 'Sign & Record' : 'Connect Wallet'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Wallet Status */}
                {!isConnected && !pendingPurchase && (
                  <div className="mb-4 p-4 bg-amber-100 border border-amber-300 rounded-xl text-amber-700">
                    <p>{context ? 'Connecting wallet...' : 'Connect your wallet to record purchases'}</p>
                  </div>
                )}

                {/* Scan Button */}
                {!pendingPurchase && !isProcessing && !successMessage && (
                  <button
                    onClick={() => {
                      setScanError('');
                      setIsScannerOpen(true);
                    }}
                    disabled={!isConnected}
                    className={`btn-primary w-full flex items-center justify-center gap-2 ${
                      !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>📷</span>
                    Scan Merchant QR Code
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-4 max-w-xs mx-auto">
                  Scan the QR code shown by the merchant to record your purchase on-chain
                </p>
              </div>
            )}
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
