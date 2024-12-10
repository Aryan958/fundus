import { Campaign } from '@/utils/interfaces'
import React from 'react'

const CampaignDetails: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        About this Campaign
      </h2>
      <p className="text-gray-600 leading-relaxed">{campaign?.description}</p>

      {/* Funding Progress */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Funding Progress
        </h3>
        <div className="w-full bg-gray-300 rounded-lg h-4">
          <div
            className="bg-green-600 h-4 rounded-lg"
            style={{
              width: `${(campaign?.amountRaised / campaign?.goal) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-gray-700">
          {campaign?.amountRaised.toLocaleString()} SOL raised of{' '}
          {campaign?.goal.toLocaleString()} SOL
        </p>
      </div>

      {/* Creator Info */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Created by</h3>
        <div className="flex items-center space-x-4">
          <p className="text-gray-800 font-semibold">{campaign?.creator}</p>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails
