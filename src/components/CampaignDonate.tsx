import React from 'react'

const CampaignDonate = () => {
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
          type="number"
          id="donationAmount"
          name="donationAmount"
          placeholder="1 SOL"
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
    </div>
  )
}

export default CampaignDonate
