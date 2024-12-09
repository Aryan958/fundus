use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Contribution {
    pub donor_address: Pubkey,
    pub cid: u64,
    pub amount: u64,
}