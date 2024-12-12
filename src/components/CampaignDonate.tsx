import {
  donateToCampaign,
  fetchAllDonations,
  fetchCampaignDetails,
  getProvider,
} from '@/services/blockchain'
import { Campaign } from '@/utils/interfaces'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import React, { FormEvent, useMemo, useState } from 'react'
import { FaDollarSign, FaDonate, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

const CampaignDonate: React.FC<{ campaign: Campaign; pda: string }> = ({
  campaign,
  pda,
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [amount, setAmount] = useState('')

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await donateToCampaign(
            program!,
            publicKey!,
            pda,
            Number(amount)
          )

          setAmount('')

          await fetchCampaignDetails(program!, pda)
          await fetchAllDonations(program!, pda)

          console.log(tx)
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaDonate className="text-green-600" />
          Make a Donation
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="donationAmount"
            className="block text-gray-700 font-semibold mb-2"
          >
            Donation Amount (SOL)
          </label>
          <input
            type="text"
            name="donationAmount"
            placeholder="1 SOL"
            value={amount}
            onChange={(e) => {
              const value = e.target.value
              if (/^\d*\.?\d{0,2}$/.test(value)) {
                setAmount(value)
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            min="1"
            required
          />
          <button
            type="submit"
            disabled={!amount}
            className={`mt-4 w-full bg-green-600 hover:bg-green-700 ${
              !amount ? 'opacity-50 cursor-not-allowed' : ''
            } text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2`}
          >
            <FaDonate />
            Donate Now
          </button>
        </form>

        {publicKey && publicKey.toBase58() == campaign.creator && (
          <div className="mt-6 flex justify-between">
            <Link
              href={`/campaign/edit/${campaign.cid}`}
              className="bg-transparent hover:bg-green-600 text-green-600 hover:text-white
            font-semibold py-2 px-4 rounded-l-lg flex items-center justify-center
            w-full border border-green-600 hover:border-transparent"
            >
              <FaEdit />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => alert('Delete action triggered')}
              className="bg-green-600 hover:bg-green-700 text-white
            font-semibold py-2 px-4
            rounded-0 flex items-center justify-center w-full"
            >
              <FaTrashAlt />
              Delete
            </button>

            <button
              className="bg-transparent hover:bg-green-600 text-green-600 hover:text-white
            font-semibold py-2 px-4 rounded-r-lg flex items-center justify-center
            w-full border border-green-600 hover:border-transparent"
            >
              <FaDollarSign />
              Payout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignDonate
