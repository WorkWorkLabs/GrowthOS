'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { apiService } from '@/services/api'
import { UserProfile as UserProfileType } from '@/types/web3'
import { Header } from '@/components/Header'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileStats } from '@/components/profile/ProfileStats'

export default function ProfilePage() {
  const { isConnected, address } = useWallet()
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (address) {
        try {
          const userProfile = await apiService.getUserProfile(address)
          setProfile(userProfile)
        } catch (error) {
          console.error('Failed to load profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfile()
  }, [address])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg-blue">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl p-8 shadow-card text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔗</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-text-secondary mb-6">
              Please connect your wallet to view and edit your profile.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-blue">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl p-8 shadow-card text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg text-text-primary">Loading profile...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-blue">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* 返回按钮 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-button hover:shadow-lg text-primary hover:text-blue-600 font-medium transition-all duration-200"
          >
            <span className="text-lg">←</span>
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-text-secondary">Home</span>
            <span className="text-text-secondary">/</span>
            <span className="text-text-primary font-medium">Profile</span>
          </div>
        </div>

        {profile && (
          <>
            <ProfileHeader 
              profile={profile}
              isEditing={isEditing}
              onToggleEdit={() => setIsEditing(!isEditing)}
            />
            
            {isEditing ? (
              <ProfileForm 
                profile={profile}
                onSave={(updatedProfile) => {
                  setProfile(updatedProfile)
                  setIsEditing(false)
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileStats profile={profile} />
            )}
          </>
        )}
      </div>
    </div>
  )
}