use crate::errors::ErrorCode::*;
use crate::states::ProgramState;
use anchor_lang::prelude::*;

pub fn update_platform_settings(
    ctx: Context<UpdatePlatformSettingsCtx>,
    new_platform_fee: u64,
) -> Result<()> {
    let state = &mut ctx.accounts.program_state;
    let updater = &ctx.accounts.updater;

    // Ensure the caller is the current platform address
    if updater.key() != state.platform_address {
        return Err(Unauthorized.into());
    }

    if !(1..=100).contains(&new_platform_fee) {
        return Err(InvalidPlatformFee.into());
    }

    // Update platform settings
    state.platform_fee = new_platform_fee;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePlatformSettingsCtx<'info> {
    #[account(mut)]
    pub updater: Signer<'info>, // The signer must be the current platform address

    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
}
