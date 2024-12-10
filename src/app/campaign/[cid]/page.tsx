'use client'

import dummyCampaigns from '@/data/campaign'
import { useEffect, useState } from 'react'
import { Campaign } from '@/utils/interfaces'
import { useParams } from 'next/navigation'
import CampaignDetails from '@/components/CampaignDetails'
import CampaignDonate from '@/components/CampaignDonate'
import DonationsList from '@/components/DonationsList'

export default function CampaignPage() {
  const { cid } = useParams()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (cid) {
      // Here, you might want to filter or find the campaign based on cid instead of just setting the first one.
      setCampaign(dummyCampaigns.find((c) => c.cid === Number(cid)) || null)
    }
    setLoaded(true)
  }, [cid])

  if (!loaded) return <h4>Loading...</h4>

  // Conditional rendering based on whether campaign exists
  if (!campaign) return <h4>Campaign not found</h4>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-gray-100 min-h-screen">
        {/* Hero Section */}
        <div className="relative">
          <img
            src={campaign.imageUrl} // Assuming 'bannerImage' is not in the interface; changed to 'imageUrl'
            alt={campaign.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
              {campaign.title}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Campaign Details */}
            <CampaignDetails campaign={campaign} />

            {/* Donation Section */}
            <CampaignDonate />
          </div>

          <DonationsList donations={[]} />
        </div>
      </div>
    </div>
  )
}
