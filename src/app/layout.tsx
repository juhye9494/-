import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import Link from 'next/link'
import '@/styles/tailwind.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: '한경매거진앤북 AI 업무활용TIP',
  description: '팀원들이 직접 작성한 실무 중심 가이드를 확인해보세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-outfit bg-[#F9FAFB] text-[#111827]">
        {/* Client-side Header */}
        <Header />

        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer - 피그마 디자인 반영 */}
        <Footer />
      </body>
    </html>
  )
}
