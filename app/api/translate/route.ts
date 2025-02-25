import { NextResponse } from 'next/server'
import * as deepl from 'deepl-node'

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!)

const languageMap: { [key: string]: deepl.TargetLanguageCode } = {
  en: 'en-US',
  ja: 'ja',
  zh: 'zh',
  ko: 'ko'
}

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json()
    
    // 한국어인 경우 번역하지 않고 반환
    if (targetLanguage === 'ko') {
      return NextResponse.json({ translatedText: text })
    }

    const deeplTargetLang = languageMap[targetLanguage]
    if (!deeplTargetLang) {
      throw new Error(`Unsupported language: ${targetLanguage}`)
    }

    const result = await translator.translateText(
      text,
      null,
      deeplTargetLang,
      {
        preserveFormatting: true,
        formality: 'more'
      }
    )

    // result가 배열인지 단일 객체인지 확인
    const translatedText = Array.isArray(result) 
      ? result[0].text 
      : result.text

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
} 