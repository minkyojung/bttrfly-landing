'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppWindow } from './MacOSDesktop'

interface WindowSystemProps {
  windows: AppWindow[]
  onClose: (windowId: string) => void
  onMinimize: (windowId: string) => void
  onFocus: (windowId: string) => void
}

export function WindowSystem({ 
  windows, 
  onClose, 
  onMinimize, 
  onFocus 
}: WindowSystemProps) {
  return (
    <>
      {windows
        .filter(window => !window.isMinimized)
        .map((window) => (
          <AppWindowComponent
            key={window.id}
            window={window}
            onClose={onClose}
            onMinimize={onMinimize}
            onFocus={onFocus}
          />
        ))}
    </>
  )
}

interface AppWindowComponentProps {
  window: AppWindow
  onClose: (windowId: string) => void
  onMinimize: (windowId: string) => void
  onFocus: (windowId: string) => void
}

function AppWindowComponent({
  window,
  onClose,
  onMinimize,
  onFocus
}: AppWindowComponentProps) {
  return (
    <Card
      className={`absolute bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden transition-all duration-200 ${
        window.isActive ? 'z-10' : 'z-0'
      }`}
      style={{
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        maxWidth: 'calc(100% - 40px)',
        maxHeight: 'calc(100% - 100px)'
      }}
      onClick={() => onFocus(window.id)}
    >
      {/* 창 타이틀바 */}
      <div className="h-8 bg-gray-100 flex items-center justify-between px-4 border-b border-gray-200">
        {/* 왼쪽: 창 컨트롤 버튼 */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-3 h-3 p-0 rounded-full bg-red-500 hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation()
              onClose(window.id)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-3 h-3 p-0 rounded-full bg-yellow-500 hover:bg-yellow-600"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize(window.id)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-3 h-3 p-0 rounded-full bg-green-500 hover:bg-green-600"
            onClick={(e) => {
              e.stopPropagation()
              // 최대화/복원 기능 (향후 구현)
            }}
          />
        </div>
        
        {/* 중앙: 창 제목 */}
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-gray-700 truncate">
            {window.title}
          </span>
        </div>
        
        {/* 오른쪽: 여백 (대칭을 위해) */}
        <div className="w-[62px]"></div>
      </div>
      
      {/* 창 내용 */}
      <div className="flex-1 overflow-hidden">
        {window.content}
      </div>
    </Card>
  )
} 