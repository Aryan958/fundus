use crate::constants::ANCHOR_DISCRIMINATOR_SIZE;
use crate::errors::ErrorCode::*;
use crate::states::{Campaign, Transaction};
use anchor_lang::prelude::*;

pub fn donate(ctx: Context<DonateCtx>, cid: u64, amount: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let donor = &ctx.accounts.donor;
    let contribution = &mut ctx.accounts.contribution;

    // if !campaign.active {
    //     return Err(InactiveCampaign.into());
    // }

    if amount < 1_000_000_000 {
        return Err(InvalidDonationAmount.into());
    }

    // Transfer lamports from the donor to the campaign
    let tx_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &donor.key(),
        &campaign.key(),
        amount,
    );

    let result = anchor_lang::solana_program::program::invoke(
        &tx_instruction,
        &[donor.to_account_info(), campaign.to_account_info()],
    );

    if let Err(e) = result {
        msg!("Donation transfer failed: {:?}", e); // Logging transfer failure
        return Err(e.into());
    }

    campaign.amount_raised += amount;
    campaign.donors += 1;

    contribution.amount = amount;
    contribution.cid = cid;
    contribution.owner = donor.key();
    contribution.timestamp = Clock::get()?.unix_timestamp as u64;

    Ok(())
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct DonateCtx<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"campaign",
            cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = donor,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            b"donor",
            donor.key().as_ref(),
            cid.to_le_bytes().as_ref(),
            (campaign.donors + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub contribution: Account<'info, Transaction>,

    pub system_program: Program<'info, System>,
}
