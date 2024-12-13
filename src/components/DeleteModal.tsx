import React, { useMemo } from 'react'
import { FaTimes, FaTrashAlt } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '../store/globalSlices'
import { Campaign, RootState } from '@/utils/interfaces'
import {
  deleteCampaign,
  fetchCampaignDetails,
  getProvider,
} from '@/services/blockchain'
import { toast } from 'react-toastify'
import { useWallet } from '@solana/wallet-adapter-react'

const DeleteModal = ({
  campaign,
  pda,
}: {
  campaign: Campaign
  pda: string
}) => {
  const dispatch = useDispatch()
  const { setDelModal } = globalActions
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { delModal } = useSelector((states: RootState) => states.globalStates)

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleClose = () => {
    dispatch(setDelModal('scale-0'))
  }

  const handleDelete = async () => {
    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await deleteCampaign(program!, publicKey!, pda)
          handleClose()

          await fetchCampaignDetails(program!, pda)

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
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
      bg-black bg-opacity-50 transform z-[3000] transition-transform duration-300 ${delModal}`}
    >
      <div className="bg-white shadow-lg shadow-slate-900 rounded-xl w-11/12 md:w-2/5 p-6">
        <div className="flex flex-row justify-between items-center mb-6">
          <p className="text-xl font-semibold text-gray-700">
            Are you sure you want to delete this campaign?
          </p>
          <button
            type="button"
            className="border-0 bg-transparent focus:outline-none"
            onClick={handleClose}
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <div className="mb-6 text-center">
          <p className="text-lg text-gray-600">
            You are about to permanently delete the campaign{' '}
            <strong>{campaign.title}</strong>.
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            className="w-full bg-red-600 hover:bg-red-700 text-white
            font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            onClick={handleDelete}
          >
            <FaTrashAlt />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
