'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

interface HamishChatProps {
  greeting?: string
}

const DEFAULT_GREETING = "Hi! I'm Hamish, your Highland guide — how can I help?"

export default function HamishChat({ greeting }: HamishChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting || DEFAULT_GREETING },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/public/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (res.status === 503) {
        // Chatbot disabled — hide widget
        setIsHidden(true)
        return
      }

      if (!res.ok) {
        throw new Error('Chat failed')
      }

      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Hamish is having a wee break — try again in a moment." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isHidden) return null

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 'min(360px, calc(100vw - 40px))',
            maxHeight: 'min(500px, calc(100vh - 140px))',
            background: 'linear-gradient(180deg, #fdfcfa, #f7f5f0)',
            border: '1px solid rgba(61,58,54,.15)',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(44,62,80,.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(180deg, #2c3e50, #1e3040)',
              color: '#fff',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HamishAvatar size={36} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Hamish</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Your Highland Guide</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: 'none',
                background: 'rgba(255,255,255,.15)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background:
                    msg.role === 'user'
                      ? 'linear-gradient(180deg, #2c3e50, #1e3040)'
                      : 'rgba(74,124,111,.12)',
                  color: msg.role === 'user' ? '#fff' : '#3d3a36',
                  fontSize: 14,
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'rgba(74,124,111,.12)',
                  color: '#6b665e',
                  fontSize: 14,
                }}
              >
                <span style={{ animation: 'pulse 1.2s infinite' }}>Hamish is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: '1px solid rgba(61,58,54,.12)',
              padding: 12,
              display: 'flex',
              gap: 10,
              background: '#fdfcfa',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Hamish anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(61,58,54,.15)',
                background: '#fff',
                fontSize: 14,
                color: '#3d3a36',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(180deg, #4a7c6f, #3d6b5f)'
                  : 'rgba(61,58,54,.15)',
                color: input.trim() && !isLoading ? '#fff' : '#6b665e',
                fontWeight: 800,
                fontSize: 14,
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '2px solid rgba(74,124,111,.35)',
          background: 'linear-gradient(180deg, #2c3e50, #1e3040)',
          boxShadow: '0 6px 24px rgba(44,62,80,.30)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          transition: 'transform 160ms ease, box-shadow 160ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 10px 32px rgba(44,62,80,.40)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(44,62,80,.30)'
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat with Hamish'}
      >
        {isOpen ? (
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 300 }}>×</span>
        ) : (
          <>
            <HamishAvatar size={32} />
            <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, marginTop: 2 }}>Hamish</span>
          </>
        )}
      </button>

      {/* Keyframe animation for typing indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}

/**
 * Original SVG avatar: friendly Scottish guide with beard and tam o'shanter cap
 * Colors matched to site palette (navy, moss, gold)
 */
function HamishAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="23" fill="#4a7c6f" />

      {/* Face */}
      <ellipse cx="24" cy="26" rx="12" ry="13" fill="#f5d0a9" />

      {/* Beard */}
      <path
        d="M12 30 C12 40, 24 44, 24 44 C24 44, 36 40, 36 30 C36 30, 34 36, 24 38 C14 36, 12 30, 12 30Z"
        fill="#8B4513"
      />
      <path
        d="M14 28 C14 28, 14 34, 18 36 M34 28 C34 28, 34 34, 30 36"
        stroke="#6d3a0f"
        strokeWidth="1"
        fill="none"
      />

      {/* Mustache */}
      <path
        d="M16 30 C18 28, 22 29, 24 30 C26 29, 30 28, 32 30 C30 31, 26 30, 24 31 C22 30, 18 31, 16 30Z"
        fill="#8B4513"
      />

      {/* Eyes */}
      <ellipse cx="19" cy="24" rx="2.5" ry="3" fill="#fff" />
      <ellipse cx="29" cy="24" rx="2.5" ry="3" fill="#fff" />
      <circle cx="19" cy="24" r="1.5" fill="#2c3e50" />
      <circle cx="29" cy="24" r="1.5" fill="#2c3e50" />
      <circle cx="19.5" cy="23.5" r="0.5" fill="#fff" />
      <circle cx="29.5" cy="23.5" r="0.5" fill="#fff" />

      {/* Eyebrows */}
      <path d="M16 21 C17 19, 21 19, 22 21" stroke="#6d3a0f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M26 21 C27 19, 31 19, 32 21" stroke="#6d3a0f" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M24 25 L23 28 L25 28 Z" fill="#e8b88a" />

      {/* Smile (hidden under mustache but adds shape) */}
      <path d="M20 32 Q24 35, 28 32" stroke="#6d3a0f" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="15" cy="28" r="2" fill="#e8a090" opacity="0.5" />
      <circle cx="33" cy="28" r="2" fill="#e8a090" opacity="0.5" />

      {/* Tam o'shanter (Scottish cap) */}
      <ellipse cx="24" cy="14" rx="14" ry="5" fill="#2c3e50" />
      <path
        d="M10 14 C10 8, 18 4, 24 4 C30 4, 38 8, 38 14 C38 14, 34 11, 24 11 C14 11, 10 14, 10 14Z"
        fill="#2c3e50"
      />
      {/* Cap pompom */}
      <circle cx="24" cy="5" r="3" fill="#c4a35a" />
      {/* Cap band/ribbon */}
      <rect x="10" y="13" width="28" height="2" fill="#1e3040" rx="1" />

      {/* Ears */}
      <ellipse cx="11" cy="26" rx="2" ry="3" fill="#f5d0a9" />
      <ellipse cx="37" cy="26" rx="2" ry="3" fill="#f5d0a9" />
    </svg>
  )
}
