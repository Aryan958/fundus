'use client'

import {
  fetchCampaignDetails,
  getProvider,
  getReadonlyProvider,
  updateCampaign,
} from '@/services/blockchain'
import { RootState } from '@/utils/interfaces'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

export default function Page() {
  const { cid } = useParams()
  const [loaded, setLoaded] = useState(false)
  const { publicKey, sendTransaction, signTransaction } = useWallet()

  const { campaign } = useSelector((states: RootState) => states.globalStates)

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    goal: '',
  })

  const programReadonly = useMemo(() => getReadonlyProvider(), [])

  useEffect(() => {
    if (cid) {
      const fetchDetails = async () => {
        const campaignData = await fetchCampaignDetails(
          programReadonly!,
          cid as string
        )
        form.title = campaignData.title
        form.description = campaignData.description
        form.image_url = campaignData.imageUrl
        form.goal = campaignData.goal.toString()
      }

      fetchDetails()
    }
    setLoaded(true)
  }, [cid])

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { title, description, image_url, goal } = form

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await updateCampaign(
            program!,
            publicKey!,
            cid as string,
            title,
            description,
            image_url,
            Number(goal)
          )

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

  if (!loaded) return <h4>Loading...</h4>

  // Conditional rendering based on whether campaign exists
  if (!campaign) return <h4>Campaign not found</h4>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="What's the grand title?"
          maxLength={64}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 border rounded text-black"
          required
        />
        <input
          type="url"
          placeholder="Paste that fancy image URL here!"
          maxLength={256}
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full p-2 border rounded text-black"
          required
        />
        <input
          type="text"
          placeholder="How many SOLs for your dream?"
          value={form.goal}
          onChange={(e) => {
            const value = e.target.value
            if (/^\d*\.?\d{0,2}$/.test(value)) {
              setForm({ ...form, goal: value })
            }
          }}
          className="w-full p-2 border rounded text-black"
          required
        />

        <textarea
          placeholder="Tell us the epic tale of your project..."
          maxLength={512}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 border rounded text-black"
          required
        />

        <div className="mt-4 space-x-4 flex justify-start items-center">
          <button
            type="submit"
            className={`bg-green-600 hover:bg-green-700
              text-white font-semibold py-2 px-4 rounded-lg ${
                !form || !publicKey ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Update Now
          </button>

          <Link
            href={`/campaign/${cid}`}
            className="bg-black hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  )
}
