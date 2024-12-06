const anchor = require('@coral-xyz/anchor')
const { SystemProgram, PublicKey } = anchor.web3

describe('fundus', () => {
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)
  const program = anchor.workspace.Fundus

  let CID: any, DONOR_COUNT: any

  it('creates a campaign', async () => {
    const user = provider.wallet

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

    await program.rpc.createCampaign(title, description, image_url, goal, {
      accounts: {
        creator: user.publicKey,
        campaign: campaignPda,
        programState: programStatePda,
        systemProgram: SystemProgram.programId,
      },
    })

    const campaign = await program.account.campaign.fetch(campaignPda)
    console.log('Campaign:', campaign)
    DONOR_COUNT = campaign.donors
  })

  it('donate to campaign', async () => {
    const user = provider.wallet

    const [campaignPda] = await PublicKey.findProgramAddress(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const [contributionPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('donor'),
        user.publicKey.toBuffer(),
        CID.toArrayLike(Buffer, 'le', 8),
        DONOR_COUNT.add(new anchor.BN(1)).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    const donorBefore = await provider.connection.getBalance(user.publicKey)
    const campaignBefore = await provider.connection.getBalance(campaignPda)

    const donation_amount = new anchor.BN(Math.round(1.5 * 1_000_000_000)) // 1.5 SOL in lamports
    await program.rpc.donate(CID, donation_amount, {
      accounts: {
        donor: user.publicKey,
        campaign: campaignPda,
        contribution: contributionPda,
        systemProgram: SystemProgram.programId,
      },
    })

    const donorAfter = await provider.connection.getBalance(user.publicKey)
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
})
