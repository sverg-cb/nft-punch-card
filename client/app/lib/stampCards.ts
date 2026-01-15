export interface StampCard {
  id: string;
  name: string;
  image: string; // Now an image URL instead of emoji
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
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
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
