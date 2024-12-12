import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from '@solana/web3.js'
import idl from '../../anchor/target/idl/fundus.json'
import { Fundus } from '../../anchor/target/types/fundus'
import { Campaign, Transaction } from '@/utils/interfaces'
import { globalActions } from '@/store/globalSlices'
import { store } from '@/store'

let tx: any
const { setCampaign, setDonations } = globalActions
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Fundus> | null => {
  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected or missing signTransaction.')
    return null
  }

  const connection = new Connection(RPC_URL)
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: 'processed' }
  )

  return new Program<Fundus>(idl as any, provider)
}

export const getReadonlyProvider = (): Program<Fundus> => {
  const connection = new Connection(RPC_URL, 'confirmed')

  // Use a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
    signAllTransactions: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
  }

  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: 'processed',
  })

  return new Program<Fundus>(idl as any, provider)
}

export const createCampaign = async (
  program: Program<Fundus>,
  publicKey: PublicKey,
  title: string,
  description: string,
  image_url: string,
  goal: number
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    program.programId
  )

  const state = await program.account.programState.fetch(programStatePda)
  const CID = state.campaignCount.add(new BN(1))

  const [campaignPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
    program.programId
  )

  tx = await program.methods
    .createCampaign(title, description, image_url, new BN(goal))
    .accountsPartial({
      creator: publicKey,
      campaign: campaignPda,
      programState: programStatePda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    'confirmed'
  )
  await connection.confirmTransaction(tx, 'finalized')

  return tx
}

export const donateToCampaign = async (
  program: Program<Fundus>,
  publicKey: PublicKey,
  pda: string,
  amount: number
): Promise<TransactionSignature | any> => {
  try {
    const campaign = await program.account.campaign.fetch(pda)

    const [contributionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('donor'),
        publicKey.toBuffer(),
        campaign.cid.toArrayLike(Buffer, 'le', 8),
        campaign.donors.add(new BN(1)).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    tx = await program.methods
      .donate(campaign.cid, new BN(Math.round(amount * 1_000_000_000)))
      .accountsPartial({
        donor: publicKey,
        campaign: pda,
        contribution: contributionPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    const connection = new Connection(
      program.provider.connection.rpcEndpoint,
      'confirmed'
    )
    await connection.confirmTransaction(tx, 'finalized')

    return tx
  } catch (error) {
    return error
  }
}

export const fetchAllCampaigns = async (
  program: Program<Fundus>
): Promise<Campaign[]> => {
  const campaigns = await program.account.campaign.all()
  return serializedCampaign(campaigns)
}

const serializedCampaign = (campaigns: any[]): Campaign[] =>
  campaigns.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    cid: c.account.cid.toNumber(),
    creator: c.account.creator.toBase58(),
    goal: c.account.goal.toNumber(),
    amountRaised: c.account.amountRaised.toNumber() / 1e9,
    donors: c.account.donors.toNumber(),
    withdrawals: c.account.withdrawals.toNumber(),
    timestamp: c.account.timestamp.toNumber() * 1000,
  }))

export const fetchCampaignDetails = async (
  program: Program<Fundus>,
  pda: string
): Promise<Campaign> => {
  const campaign = await program.account.campaign.fetch(pda)

  const serialized: Campaign = {
    ...campaign,
    publicKey: pda,
    cid: campaign.cid.toNumber(),
    creator: campaign.creator.toBase58(),
    goal: campaign.goal.toNumber(),
    amountRaised: campaign.amountRaised.toNumber() / 1e9,
    donors: campaign.donors.toNumber(),
    withdrawals: campaign.withdrawals.toNumber(),
    timestamp: campaign.timestamp.toNumber() * 1000,
  }

  store.dispatch(setCampaign(serialized))
  return serialized
}

export const fetchAllDonations = async (
  program: Program<Fundus>,
  pda: string
): Promise<Transaction[]> => {
  const campaign = await program.account.campaign.fetch(pda)

  const transactions = await program.account.transaction.all()

  const donations = transactions.filter((tx) => {
    return tx.account.cid.eq(campaign.cid)
  })

  store.dispatch(setDonations(serializedTransactions(donations)))
  return serializedTransactions(donations)
}

const serializedTransactions = (transactions: any[]): Transaction[] =>
  transactions.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(), // Convert to string
    cid: c.account.cid.toNumber(),
    owner: c.account.owner.toBase58(),
    amount: c.account.amount.toNumber() / 1e9,
    timestamp: c.account.timestamp.toNumber() * 1000,
  }))
