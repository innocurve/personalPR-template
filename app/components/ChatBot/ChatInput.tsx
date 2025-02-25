'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAudio } from '@/app/contexts/AudioContext'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
  id: string
}

interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  isDarkMode?: boolean
  isVoiceMode?: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = '메시지를 입력하세요...',
  isDarkMode,
  isVoiceMode,
}) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLocalProcessing, setIsLocalProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState<number>(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneStreamRef = useRef<MediaStream | null>(null)
  const recordingStartRef = useRef<number | null>(null)
  
  const { isProcessing, setIsProcessing } = useAudio()

  // 음성 검증을 위한 무효한 구문 목록 추가
  const invalidPhrases = [
    '끝',
    '완성',
    'MBC 뉴스 이덕영입니다.'
  ];

  // 텍스트 검증 함수
  const validateText = (text: string): string | null => {
    // 1. 빈 텍스트 체크
    if (!text?.trim()) {
      return null;
    }

    // 2. 너무 짧은 텍스트 체크
    if (text.trim().length < 2) {
      return null;
    }

    // 3. 의미 없는 텍스트 체크
    if (invalidPhrases.some(phrase => 
      text.toLowerCase().includes(phrase.toLowerCase())
    )) {
      return null;
    }

    return text.trim();
  };

  // 텍스트 입력 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  // 음성 데이터 처리 (STT API 호출)
  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsLocalProcessing(true)
      setIsProcessing(true)
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('음성 변환에 실패했습니다.')
      }

      const data = await response.json()
      
      // 음성 인식 결과 검증
      const validatedText = data.text ? validateText(data.text) : null;
      
      if (validatedText) {
        onSendMessage(validatedText)
        toast.success('음성 인식이 완료되었습니다', {
          className: 'dark-toast toast-success'
        })
      } else {
        // 음성이 인식되지 않았거나 유효하지 않은 텍스트인 경우
        toast.error('음성이 감지되지 않았습니다.', {
          className: 'dark-toast toast-error'
        })
      }
    } catch (error) {
      console.error('음성 처리 오류:', error)
      toast.error('음성을 텍스트로 변환하는 중 오류가 발생했습니다.', {
        className: 'dark-toast toast-error'
      })
    } finally {
      setIsLocalProcessing(false)
      setIsProcessing(false)
    }
  }

  // 녹음 관련 리소스 정리
  const cleanupRecording = () => {
    setIsRecording(false)
    setAudioLevel(0)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop())
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
    recordingStartRef.current = null
  }

  // 음성 녹음 시작
  const startRecording = async () => {
    // 다른 오디오 처리 중이면 무시
    if (isProcessing && !isRecording) {
      toast.error('다른 오디오 처리가 진행 중입니다. 잠시 후 다시 시도해주세요.', {
        className: 'dark-toast toast-error'
      })
      return
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphoneStreamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      recordingStartRef.current = Date.now()

      // 오디오 컨텍스트 및 분석기 설정 (음성 레벨 표시용)
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const updateAudioLevel = () => {
        if (!isRecording) return
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setAudioLevel(average)
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // 녹음 시간이 1초 이상인지 체크
        const recordingTime = recordingStartRef.current ? Date.now() - recordingStartRef.current : 0
        if (recordingTime < 1000) {
          toast.error('음성이 너무 짧습니다. 1초 이상 말씀해 주세요.', {
            className: 'dark-toast toast-error'
          })
          cleanupRecording()
          return
        }
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        cleanupRecording()
      }

      mediaRecorder.start(1000) // 1초마다 데이터 수집
      setIsRecording(true)
      setIsProcessing(true)
      toast.success('음성 인식을 시작합니다', {
        className: 'dark-toast toast-success'
      })
      updateAudioLevel()
    } catch (error) {
      console.error('녹음 시작 오류:', error)
      toast.error('마이크 접근 권한이 필요합니다', {
        className: 'dark-toast toast-error'
      })
    }
  }

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('음성 인식이 완료되었습니다', {
        className: 'dark-toast toast-success'
      })
    }
  }

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      cleanupRecording()
    }
  }, [isRecording])

  // isVoiceMode에 따른 자동 녹음 시작/종료
  useEffect(() => {
    if (isVoiceMode && !isRecording && !isProcessing) {
      startRecording()
    }
    if (!isVoiceMode && isRecording) {
      stopRecording()
    }
  }, [isVoiceMode, isRecording, isProcessing])

  // 녹음 중일 때는 placeholder 변경
  const getPlaceholder = () => {
    return isRecording ? '음성인식 중입니다...' : placeholder
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`flex items-center rounded-lg border p-2 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={getPlaceholder()}
          className="flex-grow px-3 py-2 outline-none bg-transparent"
          disabled={isRecording || isLocalProcessing}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLocalProcessing || (isProcessing && !isRecording)}
            className={`p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${
              isLocalProcessing || (isProcessing && !isRecording) ? 'cursor-not-allowed opacity-50' : ''
            }`}
            title={
              isRecording 
                ? '녹음 중지' 
                : isProcessing && !isRecording 
                  ? '다른 오디오 처리 중' 
                  : '음성으로 입력'
            }
          >
            {isLocalProcessing ? (
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                  변환 중...
                </span>
              </div>
            ) : isRecording ? (
              <div className="relative">
                <MicOff className="w-5 h-5 text-red-500" />
                <div
                  className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"
                  style={{
                    transform: `scale(${1 + audioLevel / 100})`,
                    opacity: 0.8,
                  }}
                />
              </div>
            ) : (
              <Mic className={`w-5 h-5 ${isProcessing ? 'text-gray-400' : ''}`} />
            )}
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isLocalProcessing}
            className={`p-2 rounded-full ${
              message.trim() && !isLocalProcessing
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  )
}

export default ChatInput
