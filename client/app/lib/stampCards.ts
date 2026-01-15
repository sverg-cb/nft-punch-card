export interface StampCard {
  id: string;
  name: string;
  image: string;
  description: string;
  currentStamps: number;
  totalStamps: number;
  isRedeemed: boolean;
  merchantName: string;
  rewardDescription: string;
}

// Mock stamp card data - will eventually be read from smart contract/NFT
export const mockStampCards: StampCard[] = [
  {
    id: '1',
    name: 'Coffee Lover',
    image: '☕',
    description: 'Collect stamps for every coffee purchase',
    currentStamps: 7,
    totalStamps: 10,
    isRedeemed: false,
    merchantName: 'Sunrise Café',
    rewardDescription: 'Free large coffee of your choice',
  },
  {
    id: '2',
    name: 'Burger Buddy',
    image: '🍔',
    description: 'Get a stamp with every burger meal',
    currentStamps: 5,
    totalStamps: 5,
    isRedeemed: false,
    merchantName: 'Patty Palace',
    rewardDescription: 'Free burger combo meal',
  },
  {
    id: '3',
    name: 'Pizza Party',
    image: '🍕',
    description: 'Earn stamps on pizza orders over $15',
    currentStamps: 3,
    totalStamps: 8,
    isRedeemed: false,
    merchantName: 'Slice Heaven',
    rewardDescription: 'Free large pizza',
  },
  {
    id: '4',
    name: 'Smoothie Star',
    image: '🥤',
    description: 'Stamp for every smoothie purchase',
    currentStamps: 6,
    totalStamps: 6,
    isRedeemed: true,
    merchantName: 'Blend Bliss',
    rewardDescription: 'Free smoothie bowl',
  },
  {
    id: '5',
    name: 'Taco Tuesday',
    image: '🌮',
    description: 'Collect stamps on taco orders',
    currentStamps: 2,
    totalStamps: 7,
    isRedeemed: false,
    merchantName: 'Taco Fiesta',
    rewardDescription: 'Free taco platter',
  },
  {
    id: '6',
    name: 'Donut Delight',
    image: '🍩',
    description: 'Stamp for every dozen donuts',
    currentStamps: 4,
    totalStamps: 4,
    isRedeemed: false,
    merchantName: 'Glazed & Amazed',
    rewardDescription: 'Free dozen donuts',
  },
];

export function getStampCard(id: string): StampCard | undefined {
  return mockStampCards.find((card) => card.id === id);
}

export function isCardComplete(card: StampCard): boolean {
  return card.currentStamps >= card.totalStamps;
}

