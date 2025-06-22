'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef, useCallback } from 'react'

// 상태 타입 정의
type LockState = 'locked' | 'unlocking' | 'unlocked'

// 시간대별 맞춤형 메시지 데이터베이스 (개인화 느낌 강화)
const CONTEXTUAL_MESSAGES = {
  EARLY_MORNING: [
    "Early start! Big wins ahead 🚀",
    "Dawn energy! Getting ahead of the game ⬆️", 
    "Morning warrior! Beat the rush ⚡",
    "Rise and grind! Fresh possibilities ✨",
    "Early bird! Time to soar 🦅",
    "Dawn vibes! Day one energy 🔥"
  ],
  
  MORNING: [
    "Good morning! Let's build something amazing 🛠️",
    "Morning flow! Fresh ideas incoming 💡", 
    "AM energy! Time to create ⚡",
    "Morning momentum! Ready to ship? 🚢",
    "Rise and code! What's brewing? ☕",
    "Good AM! Execute mode: ON 🎯",
    "Morning magic! Let's make it happen ✨"
  ],
  
  AFTERNOON: [
    "Afternoon grind! Keep shipping 📦",
    "Midday momentum! Staying in the zone 🎯",
    "PM vibes! Making solid progress 📊",
    "Afternoon flow! Building something great 💪",
    "Midday hustle! In the zone ⚡",
    "PM power! Iterate and improve 🔄",
    "Afternoon focus! Almost there 🏗️"
  ],
  
  EVENING: [
    "Evening push! Almost there ✨",
    "Sunset energy! Final sprint 🏁",
    "End-of-day flow! Solid work today 👏",
    "Evening grind! Wrapping up strong 💪",
    "Golden hour! End on a high note 📈",
    "Sunset vibes! One more push 🌅",
    "Evening magic! Strong finish ahead ⭐"
  ],
  
  NIGHT: [
    "Late night? Ideas never sleep 💭",
    "Night shift! Deep work hours ⭐",
    "Midnight mode! When inspiration hits ⚡",
    "Night owl! Burning the midnight oil 🕯️",
    "After hours! This is when magic happens ✨",
    "Late vibes! Night shift activated 🌙",
    "Midnight hustle! Deep focus time 🎯"
  ]
} as const

// 시간대별 맞춤형 메시지 선택 함수 (개선된 버전)
const getContextualMessage = (): string => {
  const hour = new Date().getHours()
  
  let timeCategory: keyof typeof CONTEXTUAL_MESSAGES
  
  if (hour >= 5 && hour < 8) {
    timeCategory = 'EARLY_MORNING'
  } else if (hour >= 8 && hour < 12) {
    timeCategory = 'MORNING'
  } else if (hour >= 12 && hour < 17) {
    timeCategory = 'AFTERNOON'
  } else if (hour >= 17 && hour < 21) {
    timeCategory = 'EVENING'
  } else {
    timeCategory = 'NIGHT'
  }
  
  const messages = CONTEXTUAL_MESSAGES[timeCategory]
  const randomIndex = Math.floor(Math.random() * messages.length)
  
  return messages[randomIndex]
}

interface ScreenContent {
  id: string
  title: string
  content: React.ReactNode
}

interface WindowState {
  isOpen: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  currentScreenIndex: number
  isTransitioning: boolean
}

interface VirtualMonitorProps {
  className?: string
  screenBrightness?: number
  margin?: number
}

// 드래그 가능한 윈도우 컴포넌트 (추후 구현)
function DraggableWindow({ 
  windowState, 
  isJustOpened, 
  monitorRef,
  setWindowState 
}: { 
  windowState: WindowState
  isJustOpened: boolean
  monitorRef: React.RefObject<HTMLDivElement | null>
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasInitializedPosition, setHasInitializedPosition] = useState(false)
  const windowRef = useRef<HTMLDivElement | null>(null)
  const monitorBoundsRef = useRef<DOMRect | null>(null)
  
  // position은 windowState에서 직접 사용 (이중 상태 제거)

  // 스크린 콘텐츠 정의
  const screens: ScreenContent[] = [
    {
      id: 'intro',
      title: 'Bttrfly',
      content: (
        <div className="h-full w-full overflow-y-auto overflow-x-visible">
          <div className="p-5 space-y-1 text-[12pt] leading-relaxed w-full overflow-y-auto overflow-x-visible break-words tracking-tighter">
            <p className="text-white/80 text-[15pt] font-bold break-normal tracking-tight">
            Bttrfly, Markdown note-taking app
            </p>
            
            <p className="text-white/80 break-normal" style={{ letterSpacing: '-0.0125em' }}>
              Forget the complexity and bloat.
              <br />
              When inspiration hits, a blank page is enough.
              <br />
              Everything else—AI, fancy organizing—can wait.
              <br />
            </p>
            
            <p className="text-white/90 font-medium break-normal" style={{ letterSpacing: '-0.0125em' }}>
              <br />
              Simple. Essential. Yours.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      content: (
        <div className="h-full w-full overflow-y-auto overflow-x-visible">
          <div className="p-5 space-y-1 text-[12pt] leading-relaxed w-full overflow-y-auto overflow-x-visible break-words tracking-tighter">
            <p className="text-white/80 text-[15pt] font-bold break-normal tracking-tight">
            Key Features
            </p>
            
            <p className="text-white/80 break-normal font-semibold" style={{ letterSpacing: '-0.0125em' }}>
              ✨ Always on top
              <br />
              🎯 Quick note taking
              <br />
              🔄 Seamless workflow with hotkeys
              <br />
            </p>
            
            <p className="text-white/90 font-medium break-normal" style={{ letterSpacing: '-0.0125em' }}>
              <br />
              Built for productivity.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'download',
      title: 'Get Started',
      content: (
        <div className="h-full w-full overflow-y-auto overflow-x-visible">
          <div className="p-5 space-y-1 text-[12pt] leading-relaxed w-full overflow-y-auto overflow-x-visible break-words tracking-tighter">
            <p className="text-white/80 text-[15pt] font-bold break-normal tracking-tight">
            Ready to Start?
            </p>
            
            <p className="text-white/80 break-normal" style={{ letterSpacing: '-0.0125em' }}>
              Download Bttrfly and don&apos;t lose your ideas.
              <br />
              Available for macOS.
              <br />
              Free to use, no signup required.
              <br />
            </p>
            
            <p className="text-white/90 font-medium break-normal" style={{ letterSpacing: '-0.0125em' }}>
              <br />
              
            </p>
          </div>
        </div>
      )
    }
  ]

  // 화면 전환 함수
  const navigateScreen = (direction: 'prev' | 'next') => {
    if (windowState.isTransitioning) return

    const newIndex = direction === 'next'
      ? (windowState.currentScreenIndex + 1) % screens.length
      : (windowState.currentScreenIndex - 1 + screens.length) % screens.length

    setWindowState(prev => ({
      ...prev,
      currentScreenIndex: newIndex,
      isTransitioning: true
    }))

    setTimeout(() => {
      setWindowState(prev => ({ ...prev, isTransitioning: false }))
    }, 500)
  }

  // 모니터 경계 캐싱 및 업데이트
  const updateMonitorBounds = useCallback(() => {
    if (monitorRef.current) {
      monitorBoundsRef.current = monitorRef.current.getBoundingClientRect()
    }
  }, [monitorRef])

  // 경계 제한 함수 (캐싱된 값 사용)
  const constrainToMonitor = useCallback((x: number, y: number) => {
    const monitorRect = monitorBoundsRef.current
    if (!monitorRect) return { x, y }
    
    return {
      x: Math.max(0, Math.min(x, monitorRect.width - windowState.size.width)),
      y: Math.max(0, Math.min(y, monitorRect.height - windowState.size.height))
    }
  }, [windowState.size.width, windowState.size.height])

  // 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!windowRef.current) return
    
    // 모니터 경계 캐싱 업데이트
    updateMonitorBounds()
    
    const rect = windowRef.current.getBoundingClientRect()
    const monitorRect = monitorBoundsRef.current
    if (!monitorRect) return
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
    
    // 드래그 중 텍스트 선택 방지
    e.preventDefault()
  }

  // 최적화된 드래그 핸들러 (이벤트 리스너 한 번만 등록)
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const monitorRect = monitorBoundsRef.current
      if (!monitorRect) return

      const newX = e.clientX - monitorRect.left - dragOffset.x
      const newY = e.clientY - monitorRect.top - dragOffset.y
      
      const constrainedPosition = constrainToMonitor(newX, newY)
      
      // 단일 상태 업데이트로 통합
      setWindowState(prev => ({
        ...prev,
        position: constrainedPosition
      }))
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, constrainToMonitor, setWindowState])

  // 최초 윈도우 위치 초기화 (가운데 정렬)
  useEffect(() => {
    if (!monitorRef.current || !windowState.isOpen || hasInitializedPosition) return

    updateMonitorBounds()
    const monitorRect = monitorBoundsRef.current
    if (!monitorRect) return

    const initialPosition = {
        x: Math.round((monitorRect.width - windowState.size.width) / 2),
        y: Math.round((monitorRect.height - windowState.size.height) / 2)
    }
    
    setWindowState(prev => ({
      ...prev,
      position: initialPosition
    }))
    
    setHasInitializedPosition(true)
  }, [windowState.isOpen, hasInitializedPosition, constrainToMonitor, setWindowState, updateMonitorBounds, windowState.size.width, windowState.size.height, monitorRef])

  // 모니터 크기 변경시 경계 캐시만 업데이트 (위치는 유지)
  useEffect(() => {
    const currentMonitorRef = monitorRef.current
    if (!currentMonitorRef || !windowState.isOpen) return

    const updateBounds = () => {
      updateMonitorBounds() // 경계 캐시만 업데이트
    }

    // ResizeObserver 설정
    const resizeObserver = new ResizeObserver(updateBounds)
    resizeObserver.observe(currentMonitorRef)

    return () => {
      if (currentMonitorRef) {
        resizeObserver.unobserve(currentMonitorRef)
      }
    }
  }, [windowState.isOpen, updateMonitorBounds, monitorRef])

  if (!windowState.isOpen) return null
  
  return (
    <div 
      ref={windowRef}
      className={`absolute backdrop-blur-md rounded-lg overflow-hidden z-20 ${
        isJustOpened 
          ? 'opacity-0 scale-90 translate-y-4 transition-all duration-500' 
          : 'opacity-100 scale-100 translate-y-0 transition-all duration-500'
      } ${isDragging ? 'select-none' : ''}`}
      style={{
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        transitionTimingFunction: isJustOpened ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
        transitionDelay: isJustOpened ? '100ms' : '0ms',
        border: '1px solid #424245',
        cursor: isDragging ? 'grabbing' : 'default',
        // 드래그 중에는 transform 사용 (더 부드러움)
        transform: isDragging ? 'translateZ(0)' : undefined,
        willChange: isDragging ? 'transform' : 'auto'
      }}
    >
      {/* 배경 레이어 */}
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(50px) saturate(180%)',
          WebkitBackdropFilter: 'blur(50px) saturate(180%)'
        }}
      />
      
      {/* 컨텐츠 레이어 */}
      <div className="relative h-full flex flex-col overflow-hidden">
        {/* 노트창 헤더 */}
        <div 
          className={`h-8 flex items-center justify-between px-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors"></div>
          </div>
          <span className="text-xs font-medium text-white/60 absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            {screens[windowState.currentScreenIndex].title}
          </span>
          <div className="w-[62px]"></div>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-in-out flex"
            style={{
              transform: `translateX(-${windowState.currentScreenIndex * 100}%)`,
            }}
          >
            {screens.map((screen, index) => (
              <div
                key={screen.id}
                className="min-w-full h-full flex-shrink-0 relative"
                style={{ 
                  opacity: index === windowState.currentScreenIndex ? 1 : 0.3,
                  transition: 'opacity 0.5s ease-in-out'
                }}
              >
                {screen.content}
              </div>
            ))}
          </div>

          {/* 네비게이션 컨트롤 */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-between items-center px-6">
            <button
              onClick={() => navigateScreen('prev')}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-all duration-300 transform hover:scale-110"
              disabled={windowState.isTransitioning}
            >
              ←
            </button>
            <div className="flex space-x-3">
              {screens.map((_, index) => (
                <div
                  key={index}
                  className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${
                    index === windowState.currentScreenIndex
                      ? 'bg-white/90 scale-125'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => navigateScreen('next')}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-all duration-300 transform hover:scale-110"
              disabled={windowState.isTransitioning}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VirtualMonitor({
  className,
  screenBrightness = 1,
  margin = 20
}: VirtualMonitorProps) {
  // 상태 관리
  const [lockState, setLockState] = useState<LockState>('locked')
  const [isWindowJustOpened, setIsWindowJustOpened] = useState(false)
  const [showUI, setShowUI] = useState(false) // UI 애니메이션 제어용 별도 상태
  const [greetingState, setGreetingState] = useState<'none' | 'dots' | 'typing' | 'backspacing'>('none') // 통합된 인사말 상태
  const [typedText, setTypedText] = useState('') // 타이핑된 텍스트
  const [greetingMessage, setGreetingMessage] = useState('') // 인사말 메시지
  const [windowState, setWindowState] = useState<WindowState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    size: { width: 380, height: 540 },
    currentScreenIndex: 0,
    isTransitioning: false
  })

  // 모니터 컴포넌트 ref
  const monitorRef = useRef<HTMLDivElement | null>(null)
  // 오디오 ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 오디오 초기화
  useEffect(() => {
    // 오디오 객체 생성 및 설정
    audioRef.current = new Audio('/unlock-sound.wav')
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 0.5 // 볼륨 조절 (0.0 ~ 1.0)
    
    // 디버깅용 이벤트 리스너
    audioRef.current.onloadeddata = () => {
      console.log('✅ Audio file loaded successfully!')
    }
    
    audioRef.current.onerror = (error) => {
      console.error('❌ Audio loading failed:', error)
      console.error('Trying to load:', audioRef.current?.src)
    }
    
    audioRef.current.oncanplay = () => {
      console.log('🎵 Audio ready to play')
    }
    
    // 컴포넌트 언마운트시 정리
    return () => {
      if (audioRef.current) {
        audioRef.current = null
      }
    }
  }, [])

  // formatTime 함수 제거 - 사용되지 않음

  // 잠금 해제 후 노트창 열기
  useEffect(() => {
    if (lockState === 'unlocked') {
      // UI 애니메이션 완료 후 노트창 등장
      setTimeout(() => {
        setIsWindowJustOpened(true)
        setWindowState(prev => ({
          ...prev,
          isOpen: true,
          position: { x: 0, y: 0 } // 초기 위치는 DraggableWindow 컴포넌트에서 계산
        }))
        
        // 노트창 등장 애니메이션 완료 후 상태 리셋
        setTimeout(() => {
          setIsWindowJustOpened(false)
        }, 600)
      }, 800)
    }
  }, [lockState])

  // 통합된 인사말 시퀀스 관리
  useEffect(() => {
    if (showUI) {
      // 잠금해제할 때마다 새로운 메시지 선택
      const message = getContextualMessage()
      setGreetingMessage(message)
      
      // 메뉴바 애니메이션 완료 후 시작
      setTimeout(() => {
        setGreetingState('dots')
        
        // 도트 단계 (1.5초)
        setTimeout(() => {
          setGreetingState('typing')
        }, 1500)
      }, 1000)
    }
  }, [showUI])

  // 타이핑 효과
  useEffect(() => {
    if (greetingState === 'typing' && greetingMessage) {
      let currentIndex = 0
      setTypedText('')
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= greetingMessage.length) {
          setTypedText(greetingMessage.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // 2초 대기 후 백스페이스 시작
          setTimeout(() => {
            setGreetingState('backspacing')
          }, 2000)
        }
      }, 35)
      
      return () => clearInterval(typingInterval)
    }
  }, [greetingState, greetingMessage])

  // 백스페이스 효과
  useEffect(() => {
    if (greetingState === 'backspacing' && greetingMessage) {
      let currentIndex = greetingMessage.length
      
      const backspaceInterval = setInterval(() => {
        if (currentIndex >= 0) {
          setTypedText(greetingMessage.slice(0, currentIndex))
          currentIndex--
        } else {
          clearInterval(backspaceInterval)
          // 백스페이스 완료 (텍스트만 지우고 끝)
        }
      }, 35)
      
      return () => clearInterval(backspaceInterval)
    }
  }, [greetingState, greetingMessage])



  const handleUnlock = async () => {
    if (lockState !== 'locked') return // 중복 실행 방지
    
    // 사운드 재생 (사용자 상호작용으로 autoplay 제한 우회)
    try {
      if (audioRef.current) {
        console.log('🎵 Attempting to play audio:', audioRef.current.src)
        console.log('Audio readyState:', audioRef.current.readyState)
        audioRef.current.currentTime = 0 // 처음부터 재생
        await audioRef.current.play()
        console.log('✅ Audio playback started successfully')
      } else {
        console.warn('⚠️ Audio reference is null')
      }
    } catch (error) {
      console.error('❌ Audio playback failed:', error)
      // 오디오 재생 실패해도 잠금해제는 진행
    }
    
    setLockState('unlocking')
    
    // 텍스트 fade out 완료 후 UI 요소들 나타남
    setTimeout(() => {
      setLockState('unlocked')
      
      // 다음 프레임에서 UI 애니메이션 시작 (강제 리플로우 후)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowUI(true)
        })
      })
    }, 400) // 텍스트 페이드아웃 시간을 800ms에서 400ms로 단축
  }

  const openApp = (appName: string) => {
    console.log(`Opening ${appName}`)
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {/* 모니터 외부 프레임 */}
      <div 
        className="relative bg-transparent rounded-3xl shadow-2xl"
        style={{
          width: `calc(100vw - ${margin * 2}px)`,
          height: `calc(100vh - ${margin * 2}px)`
        }}
      >
        {/* 모니터 베젤 */}
        <div className="relative bg-black rounded-2xl p-1 h-full">
          {/* 실제 화면 영역 */}
          <div 
            ref={monitorRef}
            className="h-full rounded-xl overflow-hidden relative"
            style={{ 
              filter: `brightness(${screenBrightness})`
            }}
          >
            {/* 배경 (항상 표시) */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/wallpaper.png')`
              }}
            />

            {/* 잠금화면 텍스트 */}
            {(lockState === 'locked' || lockState === 'unlocking') && (
              <div 
                className={`absolute inset-0 flex flex-col items-center cursor-pointer transition-all duration-400 pt-2 ${
                  lockState === 'unlocking' 
                    ? 'opacity-0' 
                    : 'opacity-100'
                }`}
                onClick={handleUnlock}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="text-center text-white mt-16">
                  <h1 className="text-[60pt] font-bold tracking-[-0.04em]">Ideas don&apos;t queue</h1>
                  <p className="text-[22pt] font-semibold tracking-[-0.02em]">Always-on-top, keep the flow</p>
                </div>
                <div className="mt-auto mb-28">
                  <p className="text-white/60 text-[16pt] font-regular tracking-wide">Click to unlock</p>
                </div>
              </div>
            )}

            {/* 메뉴바 - 실제 콘텐츠 크기에 따른 자연스러운 변화 */}
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
                            <span className="text-white text-sm">🦋</span>
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
                        href="https://minkyojung.github.io/bttrfly-updates/downloads/Bttrfly_1.0.1_115.dmg"
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

            {/* 독 시스템 - 항상 렌더링하되 showUI 상태에 따라 애니메이션 제어 */}
            <div 
              className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-800 select-none ${
                showUI
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-full pointer-events-none'
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transitionDelay: showUI ? '200ms' : '0ms'
              }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/20 select-none">
                <div className="flex items-end space-x-1">
                  {[
                    { name: 'Finder', icon: '📁', isRunning: true },
                    { name: 'Safari', icon: '🌐', isRunning: false },
                    { name: 'Mail', icon: '📧', isRunning: false, badge: '3' },
                    { name: 'Bttrfly', icon: '🦋', isRunning: true },
                    { name: 'Terminal', icon: '⚫', isRunning: false },
                    { name: 'System Preferences', icon: '⚙️', isRunning: false },
                    { name: 'App Store', icon: '🏪', isRunning: false },
                  ].map((app) => (
                    <TooltipProvider key={app.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-12 h-12 p-0 rounded-xl hover:scale-110 transition-transform duration-200 ease-out bg-white/10 hover:bg-white/20"
                              onClick={() => openApp(app.name)}
                            >
                              <span className="text-2xl">{app.icon}</span>
                            </Button>
                            
                            {app.isRunning && (
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                            )}
                            
                            {app.badge && (
                              <Badge 
                                variant="destructive"
                                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                              >
                                {app.badge}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{app.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  
                  <div className="ml-2 pl-2 border-l border-white/20">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-12 h-12 p-0 rounded-xl hover:scale-110 transition-transform duration-200 ease-out bg-white/10 hover:bg-white/20"
                            onClick={() => openApp('Trash')}
                          >
                            <span className="text-2xl">🗑️</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Trash</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 드래그 가능한 노트창 */}
            <DraggableWindow 
              windowState={windowState} 
              isJustOpened={isWindowJustOpened} 
              monitorRef={monitorRef}
              setWindowState={setWindowState}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 