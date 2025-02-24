'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Language, translate } from '../utils/translations'
import LanguageToggle from './LanguageToggle'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationProps {
  language: Language;
}

export default function Navigation({ language }: NavigationProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const path = window.location.pathname;
    if (path !== '/') {
      router.push(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="이노커브 로고" 
                width={160} 
                height={64} 
                priority
                className="object-contain cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <Link href="/#profile" className="font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300">
                {translate('profile', language)}
              </Link>
              <Link href="/#smart-options" className="font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300">
                {translate('smartOptions', language)}
              </Link>
              <Link href="/#history" className="font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300">
                {translate('history', language)}
              </Link>
              <Link href="/#values" className="font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300">
                {translate('values', language)}
              </Link>
              <Link href="/#community" className="font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300">
                {translate('activities', language)}
              </Link>
            </nav>
            <LanguageToggle />
            <button className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="md:hidden bg-white fixed top-[72px] left-0 right-0 z-40 shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col">
              <Link href="/#profile" className="block p-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300 font-mono tracking-tight">
                {translate('profile', language)}
              </Link>
              <Link href="/#smart-options" className="block p-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300 font-mono tracking-tight">
                {translate('smartOptions', language)}
              </Link>
              <Link href="/#history" className="block p-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300 font-mono tracking-tight">
                {translate('history', language)}
              </Link>
              <Link href="/#values" className="block p-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300 font-mono tracking-tight">
                {translate('values', language)}
              </Link>
              <Link href="/#community" className="block p-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition duration-300 font-mono tracking-tight">
                {translate('activities', language)}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
} 