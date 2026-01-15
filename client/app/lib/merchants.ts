export interface Merchant {
  id: string;
  name: string;
  icon: string;
  description: string;
  stampCardName: string;
  totalStampsRequired: number;
  rewardDescription: string;
  color: string;
}

export interface UserTokenInfo {
  address: string;
  displayAddress: string;
  currentStamps: number;
  isRedeemed: boolean;
  lastVisit: string;
}

// Mock merchant data - will eventually be read from smart contract
export const mockMerchants: Merchant[] = [
  {
    id: '1',
    name: 'Sunrise Café',
    icon: '☕',
    description: 'Premium coffee and pastries',
    stampCardName: 'Coffee Lover',
    totalStampsRequired: 10,
    rewardDescription: 'Free large coffee of your choice',
    color: '#8B4513',
  },
  {
    id: '2',
    name: 'Patty Palace',
    icon: '🍔',
    description: 'Gourmet burgers and shakes',
    stampCardName: 'Burger Buddy',
    totalStampsRequired: 5,
    rewardDescription: 'Free burger combo meal',
    color: '#D2691E',
  },
  {
    id: '3',
    name: 'Slice Heaven',
    icon: '🍕',
    description: 'Authentic Italian pizzeria',
    stampCardName: 'Pizza Party',
    totalStampsRequired: 8,
    rewardDescription: 'Free large pizza',
    color: '#FF6347',
  },
  {
    id: '4',
    name: 'Blend Bliss',
    icon: '🥤',
    description: 'Fresh smoothies and bowls',
    stampCardName: 'Smoothie Star',
    totalStampsRequired: 6,
    rewardDescription: 'Free smoothie bowl',
    color: '#32CD32',
  },
  {
    id: '5',
    name: 'Taco Fiesta',
    icon: '🌮',
    description: 'Authentic Mexican cuisine',
    stampCardName: 'Taco Tuesday',
    totalStampsRequired: 7,
    rewardDescription: 'Free taco platter',
    color: '#FFD700',
  },
  {
    id: '6',
    name: 'Glazed & Amazed',
    icon: '🍩',
    description: 'Artisan donuts daily',
    stampCardName: 'Donut Delight',
    totalStampsRequired: 4,
    rewardDescription: 'Free dozen donuts',
    color: '#FF69B4',
  },
];

// Mock user token data for analytics - will be read from blockchain
export const mockUserTokens: Record<string, UserTokenInfo[]> = {
  '1': [
    { address: '0x1234567890abcdef1234567890abcdef12345678', displayAddress: '0x1234...5678', currentStamps: 7, isRedeemed: false, lastVisit: '2024-01-15' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', displayAddress: '0xabcd...ef12', currentStamps: 10, isRedeemed: true, lastVisit: '2024-01-14' },
    { address: '0x9876543210fedcba9876543210fedcba98765432', displayAddress: '0x9876...5432', currentStamps: 3, isRedeemed: false, lastVisit: '2024-01-13' },
  ],
  '2': [
    { address: '0x1234567890abcdef1234567890abcdef12345678', displayAddress: '0x1234...5678', currentStamps: 5, isRedeemed: false, lastVisit: '2024-01-15' },
    { address: '0xfedcba0987654321fedcba0987654321fedcba09', displayAddress: '0xfedc...ba09', currentStamps: 2, isRedeemed: false, lastVisit: '2024-01-12' },
  ],
  '3': [
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', displayAddress: '0xabcd...ef12', currentStamps: 3, isRedeemed: false, lastVisit: '2024-01-15' },
  ],
  '4': [
    { address: '0x1234567890abcdef1234567890abcdef12345678', displayAddress: '0x1234...5678', currentStamps: 6, isRedeemed: true, lastVisit: '2024-01-14' },
  ],
  '5': [
    { address: '0x9876543210fedcba9876543210fedcba98765432', displayAddress: '0x9876...5432', currentStamps: 2, isRedeemed: false, lastVisit: '2024-01-15' },
    { address: '0x1234567890abcdef1234567890abcdef12345678', displayAddress: '0x1234...5678', currentStamps: 5, isRedeemed: false, lastVisit: '2024-01-11' },
  ],
  '6': [
    { address: '0xfedcba0987654321fedcba0987654321fedcba09', displayAddress: '0xfedc...ba09', currentStamps: 4, isRedeemed: false, lastVisit: '2024-01-15' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', displayAddress: '0xabcd...ef12', currentStamps: 4, isRedeemed: true, lastVisit: '2024-01-13' },
  ],
};

export function getMerchant(id: string): Merchant | undefined {
  return mockMerchants.find((merchant) => merchant.id === id);
}

export function getMerchantUsers(merchantId: string): UserTokenInfo[] {
  return mockUserTokens[merchantId] || [];
}

export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
