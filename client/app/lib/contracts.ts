// MerchantPunchCard contract configuration

export const MERCHANT_PUNCH_CARD_ADDRESS = '0xC50401042d07f3Ee967253f3BAEe501893e61d79' as const;

// ABI for the functions we need
export const merchantPunchCardAbi = [
  {
    name: 'processPurchase',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'itemIds', type: 'uint256[]', internalType: 'uint256[]' }],
    outputs: [],
  },
  {
    name: 'getPurchaseHistory',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'customer', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256[10]', internalType: 'uint256[10]' }],
  },
  {
    name: 'getCatalogItems',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'itemIds', type: 'uint256[]', internalType: 'uint256[]' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct MerchantPunchCard.CatalogItem[]',
        components: [{ name: 'name', type: 'string', internalType: 'string' }],
      },
    ],
  },
  {
    type: 'event',
    name: 'PurchaseProcessed',
    inputs: [
      { name: 'customer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'itemIds', type: 'uint256[]', indexed: false, internalType: 'uint256[]' },
    ],
  },
] as const;

/**
 * Generate 1-2 random item IDs for a purchase
 * Item IDs are in range 1-100
 */
export function generateRandomItemIds(): bigint[] {
  // Randomly decide 1 or 2 items
  const count = Math.random() > 0.5 ? 2 : 1;
  
  // Generate random item IDs between 1 and 100
  return Array.from({ length: count }, () => 
    BigInt(Math.floor(Math.random() * 100) + 1)
  );
}
