'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'
import { Language, translate } from '../utils/translations'

interface ShareButtonProps {
  language: Language
}

export default function ShareButton({ language }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'InnoCard',
          url: url
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // 클립보드에 복사
      try {
        await navigator.clipboard.writeText(url)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Share"
      >
        <Share2 className="w-6 h-6" />
      </button>
      
      {showToast && (
        <div className="fixed bottom-24 right-8 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {translate('linkCopied', language)}
        </div>
      )}
    </>
  )
} 