export interface Campaign {
  publicKey: string
  cid: number
  creator: string
  title: string
  description: string
  imageUrl: string
  goal: number
  amountRaised: number
  timestamp: number
  donors: number
  withdrawals: number
  active: boolean
}

export interface Transaction {
  owner: string
  cid: number
  amount: number
  timestamp: number
}
