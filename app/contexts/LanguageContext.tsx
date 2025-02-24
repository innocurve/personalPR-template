'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');

  useEffect(() => {
    // 페이지 로드 시점 확인
    const isPageRefresh = performance.navigation.type === 1;
    
    if (isPageRefresh) {
      // 새로고침인 경우 localStorage의 값을 사용
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage) {
        setLanguageState(storedLanguage as Language);
      }
    } else {
      // 새로운 방문인 경우 한국어로 설정
      setLanguageState('ko');
      localStorage.setItem('language', 'ko');
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
} 