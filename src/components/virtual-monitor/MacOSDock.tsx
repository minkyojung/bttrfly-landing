'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface MacOSDockProps {
  onOpenApp: (appName: string) => void
}

const dockApps = [
  { name: 'Finder', icon: '📁', isRunning: true },
  { name: 'Safari', icon: '🌐', isRunning: false },
  { name: 'Mail', icon: '📧', isRunning: false, badge: '3' },
  { name: 'Bttrfly', icon: '🦋', isRunning: true },
  { name: 'Terminal', icon: '⚫', isRunning: false },
  { name: 'System Preferences', icon: '⚙️', isRunning: false },
  { name: 'App Store', icon: '🏪', isRunning: false },
]

export function MacOSDock({ onOpenApp }: MacOSDockProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/20">
        <div className="flex items-end space-x-1">
          {dockApps.map((app) => (
            <TooltipProvider key={app.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-12 h-12 p-0 rounded-xl hover:scale-110 transition-transform duration-200 ease-out bg-white/10 hover:bg-white/20"
                      onClick={() => onOpenApp(app.name)}
                    >
                      <span className="text-2xl">{app.name === 'Bttrfly' ? '🦋' : app.icon}</span>
                    </Button>
                    
                    {/* 실행 중인 앱 표시 */}
                    {app.isRunning && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                    
                    {/* 배지 (알림 수) */}
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
          
          {/* 휴지통 */}
          <div className="ml-2 pl-2 border-l border-white/20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-12 h-12 p-0 rounded-xl hover:scale-110 transition-transform duration-200 ease-out bg-white/10 hover:bg-white/20"
                    onClick={() => onOpenApp('Trash')}
                  >
                    <span className="text-2xl">🗑️</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>휴지통</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
} 