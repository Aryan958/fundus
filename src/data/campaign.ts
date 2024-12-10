import { Campaign } from '@/utils/interfaces'

const dummyCampaigns: Campaign[] = [
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

export default dummyCampaigns
