'use client'

import {
  campaigns,
  contributions,
  withdrawals as dummyWithdrawals,
} from '@/data'
import { useEffect, useMemo, useState } from 'react'
import { Campaign, Transaction } from '@/utils/interfaces'
import { useParams } from 'next/navigation'
import CampaignDetails from '@/components/CampaignDetails'
import CampaignDonate from '@/components/CampaignDonate'
import DonationsList from '@/components/DonationsList'
import WithdrawalList from '@/components/WithdrawalList'
import Image from 'next/image'
import {
  fetchCampaignDetails,
  getReadonlyProvider,
} from '@/services/blockchain'

export default function CampaignPage() {
  const { cid } = useParams()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([])
  const [loaded, setLoaded] = useState(false)

  const program = useMemo(() => getReadonlyProvider(), [])

  useEffect(() => {
    if (cid) {
      // Here, you might want to filter or find the campaign based on cid instead of just setting the first one.
      const fetchDetails = async () => {
        const data = await fetchCampaignDetails(program!, cid as string)
        setCampaign(data)
      }

      fetchDetails()
    }
    setLoaded(true)
  }, [program, cid])

  if (!loaded) return <h4>Loading...</h4>

  // Conditional rendering based on whether campaign exists
  if (!campaign) return <h4>Campaign not found</h4>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-gray-100 pb-10">
        {/* Hero Section */}
        <div className="relative">
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            width={1920} // Adjust this to match your image dimensions
            height={1080} // Adjust this to match your image dimensions
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
            <CampaignDetails campaign={campaign} />
            <CampaignDonate campaign={campaign} />
          </div>
        </div>
      </div>
      <DonationsList donations={donations} />
      <WithdrawalList withdrawals={withdrawals} />
    </div>
  )
}
