import { Contribution } from '@/utils/interfaces'
import React from 'react'

const DonationsList: React.FC<{ donations: Contribution[] }> = ({
  donations,
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Donation History</h2>
      {donations.length > 0 ? (
        <ul className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
          {donations.map((donation, index) => (
            <li key={index} className="px-4 py-2">
              <p className="text-gray-800">
                <strong>{donation.donorAddress}</strong> donated $
                {donation.amount.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No donations yet.</p>
      )}
    </div>
  )
}

export default DonationsList
