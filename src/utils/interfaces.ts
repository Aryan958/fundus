export interface Campaign {
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

export interface Contribution {
  donorAddress: string
  cid: number
  amount: number
}

export interface Withdrawal {
  creatorAddress: string
  cid: number
  amount: number
}
