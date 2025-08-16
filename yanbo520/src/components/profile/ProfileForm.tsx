'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/web3'

interface ProfileFormProps {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  onCancel: () => void
}

export function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio || '',
    email: profile.email || '',
    twitter: profile.social.twitter || '',
    linkedin: profile.social.linkedin || '',
    github: profile.social.github || '',
    website: profile.social.website || '',
    avatar: profile.avatar
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        username: formData.username,
        bio: formData.bio,
        email: formData.email,
        avatar: formData.avatar,
        social: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website
        }
      }

      // TODO: Call real API to update user profile
      // const result = await apiService.updateUserProfile(profile.walletAddress, updatedProfile)
      
      // Currently simulating save
      localStorage.setItem(`profile_${profile.walletAddress}`, JSON.stringify(updatedProfile))
      
      onSave(updatedProfile)
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
            />
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

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Twitter
              </label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                GitHub
              </label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="username"
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
                Website
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