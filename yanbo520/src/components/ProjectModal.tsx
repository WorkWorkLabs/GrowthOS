'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { Project } from '@/types'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'
import { ShoppingCart, MessageCircle, DollarSign, Eye, Heart, Star, CreditCard, Smartphone, Building } from 'lucide-react'

interface ProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  mounted: boolean
}

export function ProjectModal({ project, isOpen, onClose, mounted }: ProjectModalProps) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  
  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto m-4 animate-slideUpAndScale" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary mb-1">{project.name}</h2>
            <p className="text-text-tertiary text-sm">by {project.author}</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-primary mr-1" />
                <span className="text-primary text-lg font-bold font-brand mr-1">{project.currency}</span>
                <span className="text-primary text-2xl font-bold font-brand">{project.price}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {project.views || 0}
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {project.likes || 0}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {project.rating || 0}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light ml-4"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div 
            className="w-full h-64 rounded-lg mb-4"
            style={{
              backgroundImage: `url(${project.image || project.image_url || DEFAULT_PROJECT_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Description</h3>
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-lg text-sm font-medium shadow-tag ${TAG_COLORS[tag.type]}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4">
            {!showPaymentOptions ? (
              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  onClick={() => setShowPaymentOptions(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now - ${project.price}
                </button>
                <button 
                  className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                  onClick={() => handleContact(project)}
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Seller
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Choose Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handlePayment('wechat')}
                    >
                      <MessageCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-800">WeChat Pay</div>
                        <div className="text-sm text-gray-500">Scan QR code</div>
                      </div>
                    </button>
                    
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handlePayment('alipay')}
                    >
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-800">Alipay</div>
                        <div className="text-sm text-gray-500">Mobile payment</div>
                      </div>
                    </button>
                    
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handlePayment('card')}
                    >
                      <Building className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-800">Bank Card</div>
                        <div className="text-sm text-gray-500">Credit/Debit</div>
                      </div>
                    </button>
                    
                    <button 
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center gap-3 text-left"
                      onClick={() => handlePayment('solana')}
                    >
                      <DollarSign className="w-6 h-6 text-orange-600" />
                      <div>
                        <div className="font-medium text-gray-800">Solana</div>
                        <div className="text-sm text-gray-500">Crypto payment</div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <button 
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => setShowPaymentOptions(false)}
                >
                  ← Back
                </button>
              </div>
            )}
            
            {!showPaymentOptions && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Multiple payment methods available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Handle specific payment method
  function handlePayment(method: string) {
    const paymentMethods = {
      wechat: 'WeChat Pay',
      alipay: 'Alipay',
      card: 'Bank Card',
      solana: 'Solana Crypto'
    }
    
    alert(`Processing payment via ${paymentMethods[method as keyof typeof paymentMethods]}\n\nProduct: "${project.name}"\nPrice: $${project.price}\n\nPayment integration coming soon!`)
    console.log('Payment method selected:', method, 'for project:', project)
    setShowPaymentOptions(false)
  }

  // Handle contact seller
  function handleContact(project: Project) {
    // TODO: Implement messaging system or redirect to seller's contact
    alert(`Contact seller "${project.author}" for "${project.name}"\n\nThis will open a messaging interface or show contact details.`)
    console.log('Contact seller:', project)
  }

  return createPortal(modalContent, document.body)
}