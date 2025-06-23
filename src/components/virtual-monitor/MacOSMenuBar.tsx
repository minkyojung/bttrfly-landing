'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'

interface MacOSMenuBarProps {
  showUI: boolean
  greetingState: 'none' | 'dots' | 'typing' | 'backspacing'
  typedText: string
  greetingMessage: string
}

export function MacOSMenuBar({ 
  showUI, 
  greetingState, 
  typedText, 
  greetingMessage 
}: MacOSMenuBarProps) {
  return (
    <div 
      className={`absolute top-4 left-1/2 transform -translate-x-1/2 transition-all duration-600 select-none ${
        showUI
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: showUI ? '200ms' : '0ms'
      }}
    >
      <div className="bg-black/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 select-none">
        <div className="flex items-center space-x-4 h-6">
          {/* 왼쪽 아이콘 */}
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/10"
                  >
                    <Image
                      src="/icon-light.svg"
                      alt="Bttrfly"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bttrfly</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* 가운데 인사말 영역 - 부드러운 크기 변화 */}
          <div 
            className="transition-all duration-600 flex items-center"
            style={{
              width: greetingState !== 'none' ? 'auto' : '0px',
              maxWidth: greetingState !== 'none' ? '300px' : '0px',
              overflow: greetingState !== 'none' ? 'visible' : 'hidden',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div 
              className="flex items-center whitespace-nowrap transition-all duration-600"
              style={{
                opacity: greetingState !== 'none' ? 1 : 0,
                transform: greetingState !== 'none' ? 'translateX(0)' : 'translateX(-20px)',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* 도트 애니메이션 */}
              {greetingState === 'dots' && (
                <div className="flex items-center px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              
              {/* 타이핑/백스페이스 텍스트 */}
              {(greetingState === 'typing' || greetingState === 'backspacing') && (
                <div className="px-4 flex items-center">
                  <span className="text-white/95 font-medium text-sm tracking-wide whitespace-nowrap" 
                    style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
                  >
                    {typedText}
                    {(greetingState === 'typing' && typedText.length < greetingMessage.length) && (
                      <span className="animate-pulse">|</span>
                    )}
                    {greetingState === 'backspacing' && typedText.length > 0 && (
                      <span className="animate-pulse">|</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 오른쪽 다운로드 버튼 */}
          <div className="flex items-center space-x-3">
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-6 px-3 text-white/90 hover:bg-white hover:text-black transition-colors font-medium text-xs rounded-full border border-white/20"
            >
              <a
                href="https://holly-dodo-380.notion.site/21ba9c01b32b802088d4e88a1f750307?pvs=105"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download for Mac
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 