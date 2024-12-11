import { Campaign, Contribution, Withdrawal } from '@/utils/interfaces'

export const campaigns: Campaign[] = [
  {
    cid: 1,
    creator: '0x1234567890abcdef',
    title: 'Save the Whales',
    description: 'A campaign to fund marine conservation efforts.',
    imageUrl: 'https://dummyjson.com/image/400x200/282828',
    goal: 10000,
    amountRaised: 5600,
    timestamp: Date.now(),
    donors: 123,
    withdrawals: 2,
    active: true,
  },
  {
    cid: 2,
    creator: '0x9876543210fedcba',
    title: 'Solar for Schools',
    description: 'Bringing solar power to schools around the globe.',
    imageUrl: 'https://dummyjson.com/image/400x200/282828',
    goal: 50000,
    amountRaised: 23456,
    timestamp: Date.now() - 86400000, // A day ago
    donors: 456,
    withdrawals: 1,
    active: true,
  },
  {
    cid: 3,
    creator: '0x5555555555555555',
    title: 'Art for All',
    description: 'Supporting local artists and art education programs.',
    imageUrl: 'https://dummyjson.com/image/400x200/282828',
    goal: 15000,
    amountRaised: 14999,
    timestamp: Date.now() - 86400000 * 7, // A week ago
    donors: 789,
    withdrawals: 3,
    active: false,
  },
  {
    cid: 4,
    creator: '0xaaaaaaaabbbbbbbb',
    title: 'Books for Kids',
    description: 'Providing books to underprivileged children.',
    imageUrl: 'https://dummyjson.com/image/400x200/282828',
    goal: 8000,
    amountRaised: 7980,
    timestamp: Date.now() - 86400000 * 30, // A month ago
    donors: 321,
    withdrawals: 0,
    active: true,
  },
  {
    cid: 5,
    creator: '0xcccdddddeeeeefff',
    title: 'Clean Water Initiative',
    description: 'Ensuring clean water access in developing communities.',
    imageUrl: 'https://dummyjson.com/image/400x200/282828',
    goal: 20000,
    amountRaised: 10000,
    timestamp: Date.now() - 86400000 * 90, // 3 months ago
    donors: 654,
    withdrawals: 2,
    active: true,
  },
]

export const contributions: Contribution[] = [
  {
    donorAddress: '0x1234567890123456789012345678901234567890',
    cid: 1,
    amount: 100,
  },
  {
    donorAddress: '0x9876543210987654321098765432109876543210',
    cid: 2,
    amount: 50,
  },
  {
    donorAddress: '0x11111111111111111111111111111111111111',
    cid: 3,
    amount: 75,
  },
  {
    donorAddress: '0x22222222222222222222222222222222222222',
    cid: 4,
    amount: 25,
  },
  {
    donorAddress: '0x33333333333333333333333333333333333333',
    cid: 5,
    amount: 150,
  },
]

export const withdrawals: Withdrawal[] = [
  {
    creatorAddress: '0x9876543210987654321098765432109876543210',
    cid: 1,
    amount: 50,
  },
  {
    creatorAddress: '0x11111111111111111111111111111111111111',
    cid: 2,
    amount: 75,
  },
  {
    creatorAddress: '0x22222222222222222222222222222222222222',
    cid: 3,
    amount: 25,
  },
  {
    creatorAddress: '0x33333333333333333333333333333333333333',
    cid: 4,
    amount: 150,
  },
  {
    creatorAddress: '0x44444444444444444444444444444444444444',
    cid: 5,
    amount: 100,
  },
]
