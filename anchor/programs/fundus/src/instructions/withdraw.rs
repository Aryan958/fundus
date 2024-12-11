use crate::constants::ANCHOR_DISCRIMINATOR_SIZE;
use crate::errors::ErrorCode::*;
use crate::states::{Campaign, ProgramState, Transaction};
use anchor_lang::prelude::*;

pub fn withdraw(ctx: Context<WithdrawCtx>, cid: u64, amount: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let creator = &ctx.accounts.creator;
    let withdrawal = &mut ctx.accounts.withdrawal;
    let state = &mut ctx.accounts.program_state;
    let platform_account_info = &ctx.accounts.platform_address;

    // if !campaign.active {
    //     return Err(InactiveCampaign.into());
    // }

    if creator.key() != campaign.creator {
        return Err(Unauthorized.into());
    }

    if amount <= 0 {
        return Err(InvalidWithdrawalAmount.into());
    }

    if campaign.amount_raised < amount {
        return Err(InsufficientFund.into());
    }

    if platform_account_info.key() != state.platform_address {
        return Err(InvalidPlatformAddress.into());
    }

    let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
    if **campaign.to_account_info().lamports.borrow() - rent_balance < amount {
        msg!("Withdrawal exceeds campaign's usable balance.");
        return Err(InsufficientFund.into());
    }

    let platform_fee = amount * state.platform_fee / 100;
    let creator_amount = amount - platform_fee;

    // Transfer 95% to the creator
    **campaign.to_account_info().try_borrow_mut_lamports()? -= creator_amount;
    **creator.to_account_info().try_borrow_mut_lamports()? += creator_amount;

    // Transfer 5% to the platform
    **campaign.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
    **platform_account_info.try_borrow_mut_lamports()? += platform_fee;

    campaign.amount_raised -= amount;
    campaign.withdrawals += 1;

    withdrawal.amount = amount;
    withdrawal.cid = cid;
    withdrawal.owner = creator.key();
    withdrawal.timestamp = Clock::get()?.unix_timestamp as u64;

    Ok(())
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct WithdrawCtx<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

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
        payer = creator,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            b"withdraw",
            creator.key().as_ref(),
            cid.to_le_bytes().as_ref(),
            (campaign.withdrawals + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub withdrawal: Account<'info, Transaction>,

    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: We are passing the account to be used as the
    pub platform_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
