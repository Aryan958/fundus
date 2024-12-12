import { Campaign, GlobalState, Transaction } from '@/utils/interfaces'
import { PayloadAction } from '@reduxjs/toolkit'

export const globalActions = {
  setDonations: (state: GlobalState, action: PayloadAction<Transaction[]>) => {
    state.donations = action.payload
  },
  setWithdrawals: (
    state: GlobalState,
    action: PayloadAction<Transaction[]>
  ) => {
    state.withdrawals = action.payload
  },
  setCampaign: (state: GlobalState, action: PayloadAction<Campaign>) => {
    state.campaign = action.payload
  },
  setDelModal: (state: GlobalState, action: PayloadAction<string>) => {
    state.delModal = action.payload
  },
}
