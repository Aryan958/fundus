'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Campaign } from '@/utils/interfaces'
import CampaignCard from '@/components/CampaignCard'
import { fetchUserCampaigns, getProvider } from '@/services/blockchain'
import { useWallet } from '@solana/wallet-adapter-react'

export default function Page() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const { publicKey, sendTransaction, signTransaction } = useWallet()

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  useEffect(() => {
    if (program && publicKey) {
      fetchUserCampaigns(program, publicKey).then((data) => setCampaigns(data))
    }
  }, [publicKey])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((campaign: Campaign) => (
            <CampaignCard key={campaign.cid} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800">
            You have no campaigns available at the moment
          </h2>
          <p className="text-gray-600 mt-4">
            Launch your first campaign and make a difference!
          </p>

          <div className="mt-6">
            <a
              href="/create"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Create a Campaign
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
