use anchor_lang::prelude::*;

declare_id!("AWMHjJYpfc8iDrHRALDryZtw8X2FQubnwH5ztGnxSatu");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod fundus {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCtx>) -> Result<()> {
        let state = &mut ctx.accounts.program_state;

        if state.initialized {
            return err!(ErrorCode::AlreadyInitialized);
        }

        state.campaign_count = 0;
        state.initialized = true;
        Ok(())
    }

    pub fn create_campaign(
        ctx: Context<CreateCampaignCtx>,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let state = &mut ctx.accounts.program_state;

        state.campaign_count += 1;

        campaign.cid = state.campaign_count;
        campaign.creator = *ctx.accounts.creator.key;
        campaign.title = title;
        campaign.description = description;
        campaign.image_url = image_url;
        campaign.goal = goal;
        campaign.amount_raised = 0;
        campaign.donors = 0;
        campaign.timestamp = Clock::get()?.unix_timestamp as u64;
        campaign.active = true;

        Ok(())
    }

    pub fn donate(ctx: Context<DonateCtx>, cid: u64, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donor = &mut ctx.accounts.donor;
        let contribution = &mut ctx.accounts.contribution;

        require!(amount >= 1_000_000_000, ErrorCode::InvalidDonationAmount);

        // Transfering lamports from the donor to the campaign

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
            return Err(e.into());
        }

        campaign.amount_raised += amount;
        campaign.donors += 1;

        contribution.amount = amount;
        contribution.cid = cid;
        contribution.donor_address = donor.key();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCtx<'info> {
    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + 8 + 1, // Size for Option<u64>
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCampaignCtx<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINATOR_SIZE + Campaign::INIT_SPACE,
        seeds = [
            b"campaign",
            (program_state.campaign_count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
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
        space = ANCHOR_DISCRIMINATOR_SIZE + Contribution::INIT_SPACE,
        seeds = [
            b"donor",
            donor.key().as_ref(),
            cid.to_le_bytes().as_ref(),
            (campaign.donors + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub contribution: Account<'info, Contribution>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub cid: u64,
    pub creator: Pubkey,
    #[max_len(64)]
    pub title: String,
    #[max_len(512)]
    pub description: String,
    #[max_len(256)]
    pub image_url: String,
    pub goal: u64,
    pub amount_raised: u64,
    pub timestamp: u64,
    pub donors: u64,
    pub active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Contribution {
    pub donor_address: Pubkey,
    pub cid: u64,
    pub amount: u64,
}

#[account]
pub struct ProgramState {
    pub initialized: bool,
    pub campaign_count: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The program has already been initialized.")]
    AlreadyInitialized,
    #[msg("Amount cannot be zero.")]
    InvalidDonationAmount,
}
