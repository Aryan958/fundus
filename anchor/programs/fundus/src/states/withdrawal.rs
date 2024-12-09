use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Withdrawal {
    pub creator_address: Pubkey,
    pub cid: u64,
    pub amount: u64,
}
