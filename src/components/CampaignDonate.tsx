import { Campaign } from '@/utils/interfaces'
import Link from 'next/link'
import React, { useState } from 'react'

const CampaignDonate: React.FC<{campaign: Campaign}> = ({campaign}) => {
  const [donation, setDonate] = useState('')

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Make a Donation</h2>
      <form>
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
          value={donation}
          onChange={(e) => {
            const value = e.target.value
            if (/^\d*\.?\d{0,2}$/.test(value)) {
              setDonate(value)
            }
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          min="1"
        />
        <button
          type="submit"
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Donate Now
        </button>
      </form>

      <div className="mt-6 flex justify-between">
        <Link
          href={`/campaign/edit/${campaign.cid}`}
          className="bg-black hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-l-lg block w-full text-center"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => alert('Delete action triggered')}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-r-lg w-full text-center"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default CampaignDonate
