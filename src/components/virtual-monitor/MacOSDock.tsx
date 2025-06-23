'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'

interface MacOSDockProps {
  showUI: boolean
  onOpenApp: (appName: string) => void
  bttrflyIsRunning?: boolean
}

export function MacOSDock({ showUI, onOpenApp, bttrflyIsRunning = true }: MacOSDockProps) {
  const dockApps = [
    { name: 'Bttrfly', icon: '🦋', isRunning: bttrflyIsRunning },
    { name: 'Updates here', icon: '📝', isRunning: false },
    { name: '$0. On the house', icon: '💰', isRunning: false }
  ]

  return (
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
        <div className="flex items-end space-x-2">
          {dockApps.map((app, index) => (
            <TooltipProvider key={`${app.name}-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-12 h-12 p-0 rounded-xl hover:scale-110 transition-transform duration-200 ease-out ${
                        app.name === 'Bttrfly' 
                          ? 'bg-white/40 hover:bg-white/50' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      onClick={() => onOpenApp(app.name)}
                    >
                      {app.name === 'Bttrfly' ? (
                        <Image
                          src="/icon-dark.svg"
                          alt="Bttrfly"
                          width={38}
                          height={38}
                          className="w-9 h-9"
                        />
                      ) : (
                        <span className="text-2xl">{app.icon}</span>
                      )}
                    </Button>
                    
                    {app.isRunning && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
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
                    onClick={() => onOpenApp('Profile')}
                  >
                    <Image
                      src="/profile.png"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>I&apos;m William</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
} 