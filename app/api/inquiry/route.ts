import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // make.com 웹훅 URL (실제 URL로 교체 필요)
    const webhookUrl = process.env.MAKE_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error('Webhook URL is not configured')
    }

    // make.com 웹훅으로 데이터 전송
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        inquiry: data.inquiry,
        submittedAt: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send webhook')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inquiry submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
} 