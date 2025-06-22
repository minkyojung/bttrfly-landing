'use client'

import { MacOSMenuBar } from './MacOSMenuBar'
import { MacOSDock } from './MacOSDock'
import { WindowSystem } from './WindowSystem'
import { useState, useEffect } from 'react'

export interface AppWindow {
  id: string
  title: string
  appName: string
  isActive: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  content: React.ReactNode
}

export function MacOSDesktop() {
  const [windows, setWindows] = useState<AppWindow[]>([
    {
      id: 'bttrfly-main',
      title: 'Bttrfly - Quick Note',
      appName: 'Bttrfly',
      isActive: true,
      isMinimized: false,
      position: { x: 200, y: 100 },
      size: { width: 800, height: 600 },
      content: <div className="p-4 bg-white h-full">Bttrfly App Content</div>
    }
  ])

  const [currentTime, setCurrentTime] = useState(new Date())

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const openApp = (appName: string) => {
    // 앱 열기 로직
    console.log(`Opening ${appName}`)
  }

  const closeWindow = (windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId))
  }

  const minimizeWindow = (windowId: string) => {
    setWindows(prev => 
      prev.map(w => 
        w.id === windowId ? { ...w, isMinimized: true } : w
      )
    )
  }

  const focusWindow = (windowId: string) => {
    setWindows(prev => 
      prev.map(w => 
        w.id === windowId 
          ? { ...w, isActive: true, isMinimized: false }
          : { ...w, isActive: false }
      )
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent">
      {/* macOS 메뉴바 */}
      <MacOSMenuBar currentTime={currentTime} />
      
      {/* 데스크탑 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 데스크탑 배경 (이미 상위에서 설정됨) */}
        
        {/* 창 시스템 */}
        <WindowSystem 
          windows={windows}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFocus={focusWindow}
        />
        
        {/* 데스크탑 아이콘들 (선택적) */}
        <div className="absolute top-4 right-4 space-y-4">
          {/* 향후 데스크탑 아이콘들 추가 */}
        </div>
      </div>
      
      {/* macOS 독 */}
      <MacOSDock onOpenApp={openApp} />
    </div>
  )
} 