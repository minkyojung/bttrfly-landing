'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MacOSMenuBarProps {
  currentTime: Date
}

export function MacOSMenuBar({ currentTime }: MacOSMenuBarProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full h-7 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 text-white text-sm font-medium">
      {/* 왼쪽: Apple 로고 + 앱 메뉴 */}
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/10"
              >
                
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Apple 메뉴</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white hover:bg-white/10 font-bold"
        >
          Bttrfly
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white hover:bg-white/10"
        >
          파일
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white hover:bg-white/10"
        >
          편집
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white hover:bg-white/10"
        >
          보기
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white hover:bg-white/10"
        >
          도움말
        </Button>
      </div>
      
      {/* 오른쪽: 시스템 상태 아이콘들 */}
      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/10"
              >
                🔍
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Spotlight 검색</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/10"
              >
                🎛️
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>제어 센터</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Badge variant="secondary" className="bg-white/10 text-white border-0">
          100%
        </Badge>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/10"
              >
                📶
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wi-Fi: 연결됨</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Separator orientation="vertical" className="h-4 bg-white/20" />
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-white hover:bg-white/10 font-mono"
        >
          {formatTime(currentTime)}
        </Button>
      </div>
    </div>
  )
} 