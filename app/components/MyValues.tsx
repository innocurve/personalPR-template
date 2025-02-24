'use client'

import { useState } from 'react'
import { Language, translate } from '../utils/translations'
import SophisticatedButton from './SophisticatedButton'

interface MyValuesProps {
  language: Language
}

const MyValues: React.FC<MyValuesProps> = ({ language }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const content = {
    ko: [
      translate('valuesDescription', language),
      "특히 인공지능은 우리의 일상과 산업 전반에 걸쳐 커다란 변화를 이끌며 미래를 재정의하고 있습니다. 하지만 이러한 변화가 과연 모든 이에게 공평하게 다가가고 있는지, 그 과정을 되돌아볼 필요가 있습니다.",
      "기술 간극은 단순히 기술의 접근성 문제를 넘어, 사회적 기회와 평등에 깊은 영향을 미칩니다. 인공지능과 같은 첨단 기술은 특정 소수의 전유물이 되어서는 안 됩니다. 누구나 손쉽게 배우고 활용할 수 있는 자원이 되어야 하며, 이를 통해 모두가 혜택을 누릴 수 있어야 합니다.",
      "저희는 기술의 장벽을 낮추고, 누구나 인공지능을 통해 더 나은 삶을 누릴 수 있도록 돕는 데 최선을 다하고자 합니다. 교육과 소통을 통해 더 많은 사람들이 기술을 이해하고 활용할 수 있도록 지원하며, 모두가 함께 성장할 수 있는 포용적 환경을 만들어 나가겠습니다.",
      "기술은 사람과 사람을 연결하는 다리이자, 우리 모두를 더 나은 미래로 이끄는 중요한 도구입니다. 이러한 비전을 실현하기 위해 여러분의 지속적인 관심과 참여를 부탁드립니다.",
      "감사합니다."
    ],
    en: [
      translate('valuesDescription', language),
      "Artificial intelligence, in particular, is leading significant changes across our daily lives and industries, redefining our future. However, we need to reflect on whether these changes are reaching everyone equally.",
      "The technology gap goes beyond mere accessibility issues, deeply affecting social opportunities and equality. Advanced technologies like AI should not be the exclusive domain of a select few. They should be resources that anyone can easily learn and utilize, benefiting everyone in the process.",
      "We are committed to lowering technological barriers and helping everyone achieve a better life through AI. Through education and communication, we will support more people in understanding and utilizing technology, creating an inclusive environment where everyone can grow together.",
      "Technology is a bridge connecting people to people and an important tool leading us all to a better future. We ask for your continued interest and participation to realize this vision.",
      "Thank you."
    ],
    ja: [
      translate('valuesDescription', language),
      "特に人工知能は、私たちの日常生活や産業全般にわたって大きな変化をもたらし、未来を再定義しています。しかし、これらの変化が本当にすべての人に公平に届いているのか、そのプロセスを振り返る必要があります。",
      "技術格差は、単なる技術へのアクセスの問題を超えて、社会的機会と平等に深い影響を与えます。人工知能のような先端技術は、特定の少数の専有物となってはいけません。誰もが簡単に学び、活用できるリソースとなるべきであり、それによってすべての人が恩恵を受けられるようにすべきです。",
      "私たちは、技術の障壁を低くし、誰もが人工知能を通じてより良い生活を送れるよう支援することに全力を尽くします。教育とコミュニケーションを通じて、より多くの人々が技術を理解し活用できるよう支援し、皆が共に成長できる包括的な環境を作り上げていきます。",
      "技術は人と人をつなぐ橋であり、私たち全員をより良い未来へと導く重要なツールです。このビジョンを実現するために、皆様の継続的な関心と参加をお願いいたします。",
      "ありがとうございます。"
    ],
    zh: [
      translate('valuesDescription', language),
      "特别是人工智能正在引领我们日常生活和各行各业的重大变革，重新定义我们的未来。然而，我们需要反思这些变化是否真正平等地惠及每个人。",
      "技术鸿沟不仅仅是可及性的问题，它深刻影响着社会机会和平等。像人工智能这样的先进技术不应该成为少数人的专属领域。它们应该成为任何人都可以轻松学习和利用的资源，从而使每个人都能从中受益。",
      "我们致力于降低技术壁垒，帮助每个人通过人工智能实现更好的生活。通过教育和交流，我们将支持更多人理解和利用技术，创造一个包容的环境，让每个人都能共同成长。",
      "技术是连接人与人的桥梁，是引领我们所有人走向更美好未来的重要工具。我们恳请您持续关注和参与，以实现这一愿景。",
      "谢谢。"
    ]
  }

  const currentContent = content[language] ?? content['ko'] ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="mb-6 relative px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 flex flex-col items-center">
          <svg className="absolute top-0 left-0 w-5 sm:w-7 md:w-12 h-5 sm:h-7 md:h-12 text-gray-300 transform -translate-x-1/6 -translate-y-1/6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <h2 className="text-lg sm:text-2xl md:text-3xl relative z-10 text-center mb-4 sm:mb-5 md:mb-6">
            {translate('valuesDescription', language).split('\n').map((line: string, i: number) => (
              <span key={i} className="block text-lg sm:text-xl md:text-4xl font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <svg className="absolute bottom-0 right-0 w-5 sm:w-7 md:w-12 h-5 sm:h-7 md:h-12 text-gray-300 transform translate-x-1/6 translate-y-1/6 rotate-180" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
        <div className="space-y-4">
          {(isExpanded ? currentContent.slice(1) : currentContent.slice(1, 3)).map((paragraph, index) => (
            <p key={index} className="text-gray-600">{paragraph}</p>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <SophisticatedButton 
            expanded={isExpanded} 
            onClick={() => setIsExpanded(!isExpanded)} 
            language={language}
          />
        </div>
      </div>
    </div>
  )
}

export default MyValues