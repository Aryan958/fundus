const anchor = require('@coral-xyz/anchor')
const { SystemProgram, PublicKey } = anchor.web3

describe('fundus', () => {
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)
  const program = anchor.workspace.Fundus

  let CID: any, DONOR_COUNT: any, WITHDRAWAL_COUNT: any

  it('creates a campaign', async () => {
    const creator = provider.wallet

    const [programStatePda] = await PublicKey.findProgramAddress(
      [Buffer.from('program_state')],
      program.programId
    )

    const state = await program.account.programState.fetch(programStatePda)
    CID = state.campaignCount.add(new anchor.BN(1))

    const [campaignPda] = await PublicKey.findProgramAddress(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const title = `Test Campaign Title #${CID.toString()}`
    const description = `Test Campaign description #${CID.toString()}`
    const image_url = `https://dummy_image_${CID.toString()}.png`
    const goal = new anchor.BN(5500)

    const tx = await program.rpc.createCampaign(
      title,
      description,
      image_url,
      goal,
      {
        accounts: {
          creator: creator.publicKey,
          campaign: campaignPda,
          programState: programStatePda,
          systemProgram: SystemProgram.programId,
        },
      }
    )

    console.log('Transaction Signature:', tx)

    const campaign = await program.account.campaign.fetch(campaignPda)
    console.log('Campaign:', campaign)
    DONOR_COUNT = campaign.donors
    WITHDRAWAL_COUNT = campaign.withdrawals
  })

  it('donate to campaign', async () => {
    const donor = provider.wallet

    const [campaignPda] = await PublicKey.findProgramAddress(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const [contributionPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('donor'),
        donor.publicKey.toBuffer(),
        CID.toArrayLike(Buffer, 'le', 8),
        DONOR_COUNT.add(new anchor.BN(1)).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    const donorBefore = await provider.connection.getBalance(donor.publicKey)
    const campaignBefore = await provider.connection.getBalance(campaignPda)

    const donation_amount = new anchor.BN(Math.round(10.5 * 1_000_000_000)) // 1.5 SOL in lamports
    const tx = await program.rpc.donate(CID, donation_amount, {
      accounts: {
        donor: donor.publicKey,
        campaign: campaignPda,
        contribution: contributionPda,
        systemProgram: SystemProgram.programId,
      },
    })

    console.log('Transaction Signature:', tx)

    const donorAfter = await provider.connection.getBalance(donor.publicKey)
    const campaignAfter = await provider.connection.getBalance(campaignPda)

    const contribution = await program.account.contribution.fetch(
      contributionPda
    )
    console.log('Contribution:', contribution)

    console.log(
      `
        donorBefore: ${donorBefore},
        donorAfter: ${donorAfter},
        donation_amount: ${donation_amount.toNumber()}
      `
    )
    console.log(
      `
        campaignBefore: ${campaignBefore},
        campaignAfter: ${campaignAfter},
        donation_amount: ${donation_amount.toNumber()}
      `
    )
  })

  it('withdraws from campaign', async () => {
    const withdrawer = provider.wallet

    // Derive PDAs
    const [programStatePda] = await PublicKey.findProgramAddress(
      [Buffer.from('program_state')],
      program.programId
    )

    const [campaignPda] = await PublicKey.findProgramAddress(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const [withdrawalPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('withdraw'),
        withdrawer.publicKey.toBuffer(),
        CID.toArrayLike(Buffer, 'le', 8),
        WITHDRAWAL_COUNT.add(new anchor.BN(1)).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    // Fetch current balances
    const withdrawerBalanceBefore = await provider.connection.getBalance(
      withdrawer.publicKey
    )
    const campaignBalanceBefore = await provider.connection.getBalance(
      campaignPda
    )

    // Fetch program state for platform info
    const programState = await program.account.programState.fetch(
      programStatePda
    )
    const platformAddress = programState.platformAddress
    const platformBalanceBefore = await provider.connection.getBalance(
      platformAddress
    )

    // Define withdrawal amount (1.5 SOL in lamports)
    const withdrawalAmount = new anchor.BN(Math.round(1.5 * 1_000_000_000))

    // Execute the withdrawal
    const tx = await program.rpc.withdraw(CID, withdrawalAmount, {
      accounts: {
        creator: withdrawer.publicKey,
        campaign: campaignPda,
        withdrawal: withdrawalPda,
        platformAddress: platformAddress,
        programState: programStatePda,
        systemProgram: SystemProgram.programId,
      },
    })
    console.log('Transaction Signature:', tx)

    // Fetch updated balances
    const withdrawerBalanceAfter = await provider.connection.getBalance(
      withdrawer.publicKey
    )
    const campaignBalanceAfter = await provider.connection.getBalance(
      campaignPda
    )
    const platformBalanceAfter = await provider.connection.getBalance(
      platformAddress
    )

    // Fetch withdrawal account details
    const withdrawal = await program.account.withdrawal.fetch(withdrawalPda)
    console.log('Withdrawal Details:', withdrawal)

    // Calculate expected platform fee
    const platformFeePercentage = programState.platformFee.toNumber()
    const platformFee = Math.floor(
      (withdrawalAmount.toNumber() * platformFeePercentage) / 100
    )
    const creatorAmount = withdrawalAmount.toNumber() - platformFee

    // Log balances
    console.log(`
      Withdrawer Balance:
        Before: ${withdrawerBalanceBefore} lamports
        After:  ${withdrawerBalanceAfter} lamports
    `)
    console.log(`
      Campaign Balance:
        Before: ${campaignBalanceBefore} lamports
        After:  ${campaignBalanceAfter} lamports
    `)
    console.log(`
      Platform Balance:
        Before: ${platformBalanceBefore} lamports
        After:  ${platformBalanceAfter} lamports
        Fee Deducted: ${platformFee} lamports
    `)
    console.log(`
      Withdrawal Amount:
        Total: ${withdrawalAmount.toNumber()} lamports
        Creator's Share: ${creatorAmount} lamports
        Platform's Share: ${platformFee} lamports
    `)
  })

  it('updates platform settings', async () => {
    const updater = provider.wallet

    // Derive the Program State PDA
    const [programStatePda] = await PublicKey.findProgramAddress(
      [Buffer.from('program_state')],
      program.programId
    )

    // Fetch current state
    const programStateBefore = await program.account.programState.fetch(
      programStatePda
    )
    console.log(
      'Program State Before:',
      (programStateBefore.platformFee as string).toString()
    )

    // Generate new platform address and fee
    const newPlatformFee = 10 // New platform fee in percentage

    // Update platform settings
    await program.rpc.updatePlatformSettings(new anchor.BN(newPlatformFee), {
      accounts: {
        updater: updater.publicKey,
        programState: programStatePda,
      },
    })

    // Fetch updated state
    const programStateAfter = await program.account.programState.fetch(
      programStatePda
    )
    console.log(
      'Program State After:',
      (programStateAfter.platformFee as string).toString()
    )
  })
})
