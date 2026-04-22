'use client'

import * as React from 'react'
import Link from 'next/link'
import { Copy, Check } from 'lucide-react'

export default function Footer() {
  const [copied, setCopied] = React.useState(false)
  const email = 'juhye94@hankyung.com'

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <footer className="bg-[#0F172A] text-white py-16 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">✦</div>
            <h3 className="font-bold text-xl tracking-tight">한경매거진앤북 AI업무TIP 아카이브</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            우리만의 AI 활용 노하우를 한 곳에.<br />
            실무에서 검증된 가이드로 업무 효율을 높이세요!
          </p>
        </div>
        <div className="flex flex-col md:items-end justify-between">
          <div className="text-right">
            <h4 className="font-bold mb-4 opacity-50 text-sm tracking-widest uppercase">문의하기</h4>
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-sm">{email}</span>
              <button 
                onClick={handleCopyEmail}
                className="p-1 hover:bg-white/10 rounded transition-colors relative"
                title="이메일 복사"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-200">
                    복사되었습니다!
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="mt-8 text-right flex flex-col md:items-end gap-3">
            <Link href="/admin/login" className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-[0.2em] font-black">
              Admin Console
            </Link>
            <p className="text-xs text-gray-500">© 2026 AI Guideline Archive. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
