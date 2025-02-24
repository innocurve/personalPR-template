'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Moon, Sun, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '../hooks/useLanguage'
import { translate } from '../utils/translations'
import ChatInput, { Message } from '../components/ChatBot/ChatInput'
import ChatMessage from '../components/ChatBot/ChatMessage'
import Navigation from '../components/Navigation'

const initialMessages = {
  ko: "안녕하세요! 저는 정민기's Clone입니다. 무엇을 도와드릴까요?",
  en: "Hello! I'm Minki Jeong's Clone. How can I help you?",
  ja: "こんにちは！鄭玟基のクローンです。どのようにお手伝いできますか？",
  zh: "你好！我是郑玟基的克隆。我能为您做些什么？"
};

export default function ChatPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: initialMessages[language as keyof typeof initialMessages] || initialMessages.ko
  }]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // localStorage에서 메시지 불러오기
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        setMessages(parsedMessages);
      }
    }
  }, []);

  // 언어 변경 시 첫 메시지 업데이트
  useEffect(() => {
    setMessages(prevMessages => {
      if (prevMessages.length === 0) {
        return [{
          role: 'assistant',
          content: initialMessages[language as keyof typeof initialMessages] || initialMessages.ko
        }];
      }
      return [
        {
          role: 'assistant',
          content: initialMessages[language as keyof typeof initialMessages] || initialMessages.ko
        },
        ...prevMessages.slice(1)
      ];
    });
  }, [language]);

  // 메시지가 변경될 때마다 localStorage 업데이트
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            ...messages,
            { role: 'user', content: message }
          ],
          pdfContent: pdfContent
        })
      });

      if (!response.ok) {
        throw new Error(translate('apiError', language));
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = { 
        role: 'assistant', 
        content: data.response 
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: translate(
          error instanceof Error ? error.message : 'chatError',
          language
        )
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const clearMessages = () => {
    const initialMessage: Message = {
      role: 'assistant' as const,  // 타입을 명시적으로 'assistant'로 지정
      content: initialMessages[language as keyof typeof initialMessages] || initialMessages.ko
    };
    setMessages([initialMessage]);
    localStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Starting file upload...');
      const response = await fetch('/api/fileupload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          errorMessage = errorText;
        } catch (textError) {
          console.error('Failed to read error response:', textError);
          errorMessage = response.statusText;
        }
        throw new Error(`Upload failed (${response.status}): ${errorMessage}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('Success response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
      
      if (data.success) {
        setPdfContent(data.text);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `PDF 파일 "${data.filename}"이(가) 성공적으로 업로드되었습니다. 이제 파일 내용에 대해 질문해주세요.`
        }]);
      } else {
        throw new Error(data.error || 'Upload failed without error message');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `파일 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      }]);
    } finally {
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Navigation language={language} />
          </div>
        </div>
      </div>

      <div className={`max-w-3xl mx-auto shadow-sm min-h-[calc(100vh-80px)] pt-24 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'
      }`}>
        <header className={`flex items-center px-4 py-3 border-b ${
          isDarkMode ? 'border-gray-700' : ''
        }`}>
          <div className="flex items-center gap-2">
            <Link href="/" className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } flex items-center gap-2`}>
              <ArrowLeft className="w-5 h-5" />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Back</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-16 h-16 relative rounded-full overflow-hidden mb-2">
              <Image
                src="/profile.png"
                alt={translate('name', language)}
                fill
                sizes="(max-width: 768px) 64px, 96px"
                className="object-cover"
                priority
              />
            </div>
            <span className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{translate('name', language)}{translate('cloneTitle', language)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={clearMessages}
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 h-[calc(100vh-280px)]">
          {messages.length === 0 ? (
            <div className={`flex items-center justify-center h-full`}>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} isDarkMode={isDarkMode} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <footer className={`border-t p-4 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isDarkMode={isDarkMode} 
            placeholder={translate('chatInputPlaceholder', language)} 
          />
        </footer>
      </div>
    </div>
  )
}