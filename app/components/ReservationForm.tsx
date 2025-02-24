'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Script from 'next/script';

interface ReservationFormProps {
  onSubmit: (data: { name: string; email: string; phoneNumber: string; date: string; message: string }) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export function ReservationForm({ onSubmit, onCancel }: ReservationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [isKakaoInitialized, setIsKakaoInitialized] = useState(false);
  const [isChannelSubscribed, setIsChannelSubscribed] = useState(false);
  const kakaoButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JavaScript_KEY);
          console.log('Kakao SDK initialized');
        }
        createChannelButton();
      }
    };
    initializeKakao();
  }, []);

  const createChannelButton = () => {
    if (window.Kakao && window.Kakao.Channel && kakaoButtonRef.current) {
      window.Kakao.Channel.createAddChannelButton({
        container: kakaoButtonRef.current,
        channelPublicId: process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID,
        size: 'large',
        supportMultipleDensities: true,
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 예약 정보 전달
    onSubmit({ name, email, phoneNumber, date, message });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JavaScript_KEY);
            console.log('Kakao SDK initialized');
            createChannelButton();
          }
        }}
      />
      <CardHeader>
        <CardTitle>예약하기</CardTitle>
        <CardDescription>카카오톡 채널을 추가한 후 예약을 진행해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <p className="text-sm text-yellow-800 mb-2">
            💡 카카오톡 채널을 추가하시면 예약 확인 및 변경 사항을 실시간으로 받아보실 수 있습니다!
          </p>
          <div ref={kakaoButtonRef}></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">전화번호</label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="01012345678"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">날짜</label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">메시지</label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
        <Button type="submit" onClick={handleSubmit}>예약하기</Button>
      </CardFooter>
    </Card>
  );
}
