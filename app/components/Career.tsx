'use client'

import { useState, useMemo } from 'react'
import SophisticatedButton from './SophisticatedButton'
import { useLanguage } from '../hooks/useLanguage'

type YearHistory = {
  [key: string]: string[]
}

type HistoryByLanguage = {
  [key: string]: YearHistory
}

export default function Career() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { language } = useLanguage()

  const fullHistory: HistoryByLanguage = useMemo(() => ({
    ko: {
      "2025": [
        "KAIST Chief AI Officer Program"
      ],
      "2024": [
        "이노커브 CEO",
        "(사)대한청년을세계로 이사장",
        "연세대학교 AI 최고위과정 원우회장",
        "연세대학교 AI 최고위과정 졸업",
        "동국대학교 범죄학 석사 졸업"
      ],
      "2023": [
        "대통령직속 민주평화통일자문회의 위원",
        "대전광역시 서구 청년센터 센터장",
        "미스코리아 대전세종충남 선발대회 심사위원",
        "동국대학교 경찰사법대학원 총학생회 수석부회장"
      ],
      "2022": [
        "세종특별자치시청 정책특별보좌관",
        "세종특별자치시 특화거리심의위원회 위원",
        "제4대 세종특별자치시장직 인수위원회 위원"
      ],
      "2021": [
        "대한세팍타크로협회 이사"
      ]
    },
    en: {
      "2025": [
        "KAIST Chief AI Officer Program"
      ],
      "2024": [
        "CEO of Innocurve",
        "Chairman of the Board, Daejeon Youth to the World Association",
        "President of Yonsei University AI Executive Program Alumni Association",
        "Graduated from Yonsei University AI Executive Program",
        "Graduated from Dongguk University with a Master's degree in Criminology"
      ],
      "2023": [
        "Member of the Presidential Committee on Peace and Unification",
        "Director of Daejeon Seo-gu Youth Center",
        "Judge of Miss Korea Daejeon Sejong Chungnam Contest",
        "Vice President of Dongguk University Graduate School of Police and Criminal Justice Student Council"
      ],
      "2022": [
        "Special Policy Advisor to the Sejong Special Self-Governing City",
        "Member of the Sejong Special Self-Governing City Specialized Street Deliberation Committee",
        "Member of the 4th Sejong Special Self-Governing City Mayor Inaugural Committee"
      ],
      "2021": [
        "Director of the Korea Sepak Takraw Association"
      ]
    },
    ja: {
      "2025": [
        "KAIST Chief AI Officer Program"
      ],
      "2024": [
        "イノカーブ CEO",
        "社団法人大田青年を世界へ理事長",
        "延世大学AI最高位過程会員会長",
        "延世大学AI最高位過程卒業",
        "東国大学犯罪学修士卒業"
      ],
      "2023": [
        "大統領直属民主平和統一諮問会議委員",
        "大田広域市西区青年センターセンター長",
        "ミスコリア大田世宗忠南選抜大会審査委員",
        "東国大学警察司法大学院総学生会副会長"
      ],
      "2022": [
        "世宗特別自治市庁政策特別補佐官",
        "世宗特別自治市特化通り審議委員会委員",
        "第4代世宗特別自治市長職引受委員会委員"
      ],
      "2021": [
        "大韓セパタクロー協会理事"
      ]
    },
    zh: {
      "2025": [
        "KAIST Chief AI Officer Program"
      ],
      "2024": [
        "Innocurve首席执行官",
        "(社)韩国青年走向世界协会理事长",
        "延世大学AI高级课程校友会主席",
        "毕业于延世大学AI高级课程",
        "毕业于东国大学犯罪学硕士"
      ],
      "2023": [
        "总统直属民主和平统一咨询会议委员",
        "大田广域市西区青年中心主任",
        "韩国小姐大田世宗忠南选拔大赛评委",
        "东国大学警察司法研究生院学生会副主席"
      ],
      "2022": [
        "世宗特别自治市政策特别顾问",
        "世宗特别自治市特色街道审议委员会委员",
        "第四届世宗特别自治市长就职委员会委员"
      ],
      "2021": [
        "韩国藤球协会理事"
      ]
    }
  }), [])

  const currentHistory = useMemo(() => {
    return fullHistory[language] || fullHistory['ko']
  }, [language, fullHistory])

  const years = useMemo(() => {
    return Object.keys(currentHistory).sort((a, b) => parseInt(b) - parseInt(a))
  }, [currentHistory])

  const displayedYears = useMemo(() => {
    return isExpanded ? years : years.filter(year => parseInt(year) >= 2024)
  }, [isExpanded, years])

  return (
    <section className="mb-4 px-4 md:px-6 lg:px-8" role="region" aria-label="경력 사항">
      <div className="space-y-6">
        {displayedYears.map((year, index) => (
          <div 
            key={year} 
            className={`pb-4 ${index !== displayedYears.length - 1 ? 'border-b border-gray-200' : ''}`}
            role="article"
            aria-labelledby={`year-${year}`}
          >
            <h3 
              id={`year-${year}`}
              className="text-2xl md:text-3xl font-bold text-blue-600 mb-3"
            >
              {year}
            </h3>
            <ul className="space-y-2 text-sm md:text-base" role="list">
              {currentHistory[year]?.map((item: string, index: number) => (
                <li 
                  key={index} 
                  className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  role="listitem"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <SophisticatedButton 
          expanded={isExpanded} 
          onClick={() => setIsExpanded(!isExpanded)} 
          language={language}
          aria-expanded={isExpanded}
          aria-controls="career-history"
        />
      </div>
    </section>
  )
}