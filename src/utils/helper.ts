// utils/addressTruncator.ts

export function truncateAddress(address: string): string {
  if (!address || !address.startsWith('0x')) {
    throw new Error('Invalid Ethereum address')
  }

  const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`
  return truncated
}
