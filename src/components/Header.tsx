'use client'
import Link from 'next/link'
import React, { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          Fundus<span className="text-gray-700">Crowd</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/account"
            className="text-gray-700 hover:text-green-600 transition duration-300"
          >
            Campaigns
          </Link>
          <Link
            href="/create"
            className="text-gray-700 hover:text-green-600 transition duration-300"
          >
            Create
          </Link>
        </nav>

        {/* CTA Button */}
        <button className="hidden md:inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
          Connect Wallet
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white shadow-md py-4">
          <div className="container mx-auto px-6 space-y-4">
            <Link
              href="/account"
              className="text-gray-700 hover:text-green-600 transition duration-300"
            >
              Campaigns
            </Link>
            <Link
              href="/create"
              className="text-gray-700 hover:text-green-600 transition duration-300"
            >
              Create
            </Link>
            <button className="hidden md:inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
              Connect Wallet
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
