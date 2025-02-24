'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Language } from '../../utils/translations'

interface GalleryItem {
  id: number;
  title: { [key in Language]: string };
  image: string;
  description: { [key in Language]: string };
  content: { [key in Language]: string };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Gallery({ params }: PageProps) {
  const { id } = await params;  // params가 Promise이므로 await 사용
  const router = useRouter()
  const [gallery, setGallery] = useState<GalleryItem | null>(null)
  const [language, setLanguage] = useState<Language>('ko')

  useEffect(() => {
    // 언어 설정 가져오기
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setLanguage(storedLanguage as Language);
    }

    // 언어 변경 감지
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue) {
        setLanguage(e.newValue as Language);
      }
    };

    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  useEffect(() => {
    const fetchGallery = () => {
      try {
        const storedPosts = localStorage.getItem('posts');
        if (!storedPosts) {
          throw new Error('Posts not found');
        }
        
        const posts = JSON.parse(storedPosts);
        let foundGallery: GalleryItem | null = null;
        
        for (const post of posts) {
          if (post.gallery) {
            const galleryItem = post.gallery.find((item: GalleryItem) => item.id === Number(id));  // params.id 대신 id 사용
            if (galleryItem) {
              foundGallery = galleryItem;
              break;
            }
          }
        }
        
        if (!foundGallery) {
          throw new Error('Gallery not found');
        }
        
        setGallery(foundGallery);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        router.push('/');
      }
    };

    fetchGallery();
  }, [id, router]);  // params.id 대신 id 사용

  if (!gallery) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-5 mt-24">
      <Card>
        <CardHeader>
          <CardTitle>{gallery.title[language]}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image 
            src={gallery.image} 
            alt={gallery.title[language]} 
            width={800}
            height={600}
            className="w-full h-auto object-cover mb-4 rounded-lg"
          />
          <p className="mb-4">{gallery.description[language]}</p>
          
          <div className="mt-8">
            <Button onClick={() => router.back()}>뒤로 가기</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 