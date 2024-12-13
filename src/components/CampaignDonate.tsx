import {
  donateToCampaign,
  fetchAllDonations,
  fetchCampaignDetails,
  getProvider,
} from '@/services/blockchain'
import { globalActions } from '@/store/globalSlices'
import { Campaign } from '@/utils/interfaces'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import React, { FormEvent, useMemo, useState } from 'react'
import { FaDollarSign, FaDonate, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

const CampaignDonate: React.FC<{ campaign: Campaign; pda: string }> = ({
  campaign,
  pda,
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [amount, setAmount] = useState('')

  const { setWithdrawModal, setDelModal } = globalActions
  const dispatch = useDispatch()

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Number(amount) + campaign.amountRaised > campaign.goal) {
      return toast.warn('Amount exceeds campaign goal')
    }

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
            placeholder={`1 SOL (${(
              campaign.goal - campaign.amountRaised
            ).toFixed(2)} SOL remaining)`}
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
            disabled={
              !amount ||
              !publicKey ||
              !campaign.active ||
              campaign.amountRaised >= campaign.goal
            }
            className={`mt-4 w-full bg-green-600 hover:bg-green-700 ${
              !amount ||
              !publicKey ||
              !campaign.active ||
              campaign.amountRaised >= campaign.goal
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2`}
          >
            <FaDonate />
            Donate Now
          </button>
        </form>

        {publicKey && publicKey.toBase58() == campaign.creator && (
          <div className="mt-6 flex justify-between">
            <Link
              href={`/campaign/edit/${pda}`}
              className="bg-transparent hover:bg-green-600 text-green-600 hover:text-white
            font-semibold py-2 px-4 rounded-l-lg flex items-center justify-center
            w-full border border-green-600 hover:border-transparent"
            >
              <FaEdit />
              Edit
            </Link>
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white
            font-semibold py-2 px-4
            rounded-0 flex items-center justify-center w-full"
              onClick={() => dispatch(setDelModal('scale-100'))}
            >
              <FaTrashAlt />
              Delete
            </button>

            <button
              className="bg-transparent hover:bg-green-600 text-green-600 hover:text-white
            font-semibold py-2 px-4 rounded-r-lg flex items-center justify-center
            w-full border border-green-600 hover:border-transparent"
              onClick={() => dispatch(setWithdrawModal('scale-100'))}
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
