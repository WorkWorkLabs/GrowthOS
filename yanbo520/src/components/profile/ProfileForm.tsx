'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/web3'
import { useAuth } from '@/providers/AuthProvider'

interface ProfileFormProps {
  profile: UserProfile
  onSave: () => void
  onCancel: () => void
}

export function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const { updateProfile, connectWallet } = useAuth()
  
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio || '',
    avatar: profile.avatar,
    wechat: profile.social?.wechat || '',
    alipay: profile.social?.alipay || '',
    linkedin: profile.social?.linkedin || '',
    website: profile.social?.website || '',
  })
  
  const [loading, setLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [connectingWallet, setConnectingWallet] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar,
        social: {
          wechat: formData.wechat,
          alipay: formData.alipay,
          linkedin: formData.linkedin,
          website: formData.website,
          twitter: '',
          github: '',
        }
      })
      
      onSave()
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectWallet = async () => {
    if (!walletAddress.trim()) {
      alert('Please enter a wallet address')
      return
    }

    setConnectingWallet(true)
    try {
      await connectWallet(walletAddress.trim())
      setWalletAddress('')
      alert('Wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setConnectingWallet(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              placeholder="Email cannot be changed"
            />
            <p className="text-xs text-gray-500 mt-1">Email is linked to your account and cannot be changed</p>
          </div>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Wallet Connection */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Crypto Wallet</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {profile.walletAddress ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Connected Wallet</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Connected
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Connect your crypto wallet (optional)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0x... wallet address"
                  />
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={connectingWallet}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {connectingWallet ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                WeChat ID
              </label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => handleInputChange('wechat', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your WeChat ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Alipay Account
              </label>
              <input
                type="text"
                value={formData.alipay}
                onChange={(e) => handleInputChange('alipay', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your Alipay account"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Personal Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}