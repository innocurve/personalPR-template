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
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = '메시지를 입력하세요...',
  isDarkMode,
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
  
  const { isProcessing, setIsProcessing } = useAudio()

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

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
      if (data.text) {
        // 음성 인식 결과를 바로 전송
        onSendMessage(data.text)
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

  const startRecording = async () => {
    // 다른 오디오 처리 중이면 무시
    if (isProcessing) {
      toast.error('다른 오디오 처리가 진행 중입니다. 잠시 후 다시 시도해주세요.', {
        className: 'dark-toast toast-error'
      })
      return
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      microphoneStreamRef.current = stream

      // 오디오 컨텍스트 설정
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      audioContextRef.current = audioContext

      // 음성 레벨 모니터링
      const updateAudioLevel = () => {
        if (!isRecording) return
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average)
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }
      updateAudioLevel()

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error)
        }
      }

      mediaRecorder.start(1000) // 1초마다 데이터 수집
      setIsRecording(true)
      setIsProcessing(true)
      toast.success('음성 인식을 시작합니다', {
        className: 'dark-toast toast-success'
      })
    } catch (error) {
      console.error('녹음 시작 오류:', error)
      toast.error('마이크 접근 권한이 필요합니다', {
        className: 'dark-toast toast-error'
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('음성 인식이 완료되었습니다', {
        className: 'dark-toast toast-success'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className="flex items-center rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-grow px-3 py-2 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          disabled={isRecording || isLocalProcessing}
        />
        <div className="flex items-center gap-1">
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
                    opacity: 0.8
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
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-400'
            } transition-colors`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  )
}

export default ChatInput