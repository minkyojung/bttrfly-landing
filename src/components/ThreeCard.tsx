'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'

interface ThreeCardProps {
  radius?: number
  width?: number
  height?: number
  thickness?: number
  showMacButtons?: boolean // macOS 버튼 표시 여부
  markdownContent?: string // 마크다운 컨텐츠 prop 추가
  title?: string // 메인 제목
  subtitle?: string // 부제목
}

// 마크다운을 Canvas 텍스처로 변환하는 함수
function createMarkdownTexture(markdownContent: string, width: number, height: number): THREE.CanvasTexture {
  // Canvas 생성
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  
  // 고해상도 설정 (선명한 텍스트)
  const scale = 2
  canvas.width = width * scale
  canvas.height = height * scale
  context.scale(scale, scale)
  
  // 배경 설정 (투명)
  context.clearRect(0, 0, width, height)
  
  // 마크다운 라인별로 파싱
  const lines = markdownContent.split('\n')
  let currentY = 50 // 시작 위치를 더 위에서 시작
  const lineHeight = 28 // 줄 간격을 더 넓게
  const leftMargin = 30 // 왼쪽 여백 확대
  
  lines.forEach((line) => {
    line = line.trim()
    if (!line) {
      currentY += lineHeight * 0.6 // 빈 줄 간격
      return
    }
    
    // 제목 처리
    if (line.startsWith('#### ')) {
      context.fillStyle = '#ffffff'
      context.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      context.fillText(line.replace('#### ', ''), leftMargin, currentY)
      currentY += lineHeight + 10
    }
    else if (line.startsWith('### ')) {
      context.fillStyle = '#ffffff'
      context.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      context.fillText(line.replace('### ', ''), leftMargin, currentY)
      currentY += lineHeight + 12
    }
    else if (line.startsWith('## ')) {
      context.fillStyle = '#ffffff'
      context.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      context.fillText(line.replace('## ', ''), leftMargin, currentY)
      currentY += lineHeight + 15
    }
    else if (line.startsWith('# ')) {
      context.fillStyle = '#ffffff'
      context.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      context.fillText(line.replace('# ', ''), leftMargin, currentY)
      currentY += lineHeight + 18
    }
    // 체크박스 처리
    else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      const isChecked = line.startsWith('- [x]')
      const text = line.replace(/^- \[[x ]\]\s*/, '')
      
      context.fillStyle = '#ffffff'
      
      const checkboxSymbol = isChecked ? '☑ ' : '☐ '
      const maxWidth = width - 100
      
      // 볼드 처리와 줄바꿈을 함께 처리
      if (text.includes('**')) {
        // 볼드 텍스트가 포함된 경우
        let currentY_local = currentY
        let currentX = leftMargin
        
        // 체크박스 심볼 먼저 렌더링
        context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        context.fillText(checkboxSymbol, currentX, currentY_local)
        currentX += context.measureText(checkboxSymbol).width
        
        // 텍스트를 ** 기준으로 분할
        const parts = text.split('**')
        
        parts.forEach((part, index) => {
          if (!part) return
          
          // 폰트 설정
          if (index % 2 === 0) {
            context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
          } else {
            context.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
          }
          
          // 단어별로 줄바꿈 체크
          const words = part.split(' ')
          words.forEach((word, wordIndex) => {
            if (!word) return
            
            const wordWithSpace = word + (wordIndex < words.length - 1 ? ' ' : '')
            const wordWidth = context.measureText(wordWithSpace).width
            
            // 줄바꿈 체크
            if (currentX + wordWidth > leftMargin + maxWidth && currentX > leftMargin + context.measureText(checkboxSymbol).width) {
              currentY_local += lineHeight
              currentX = leftMargin + context.measureText(checkboxSymbol).width // 들여쓰기
            }
            
            context.fillText(wordWithSpace, currentX, currentY_local)
            currentX += wordWidth
          })
        })
        
        currentY = currentY_local + lineHeight
      } else {
        // 일반 텍스트인 경우 (기존 로직)
        context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        
        const fullText = `${checkboxSymbol}${text}`
        
        // 단순한 줄바꿈 처리
        const words = fullText.split(' ')
        let currentLine = ''
        
        words.forEach((word, wordIndex) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          const testWidth = context.measureText(testLine).width
          
          if (testWidth > maxWidth && currentLine.length > 0) {
            context.fillText(currentLine, leftMargin, currentY)
            currentY += lineHeight
            currentLine = word
          } else {
            currentLine = testLine
          }
          
          // 마지막 단어인 경우
          if (wordIndex === words.length - 1 && currentLine.length > 0) {
            context.fillText(currentLine, leftMargin, currentY)
          }
        })
        
        currentY += lineHeight
      }
    }
    // 일반 텍스트 처리 (볼드, 이탤릭 포함)
    else {
      context.fillStyle = '#ffffff'
      let textX = leftMargin
      
      // 이탤릭과 볼드 처리
      if (line.includes('*')) {
        const parts = line.split(/(\*[^*]+\*|\*\*[^*]+\*\*)/g)
        parts.forEach((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // 볼드
            context.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            const text = part.replace(/\*\*/g, '')
            context.fillText(text, textX, currentY)
            textX += context.measureText(text).width
          } else if (part.startsWith('*') && part.endsWith('*')) {
            // 이탤릭
            context.font = 'italic 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            const text = part.replace(/\*/g, '')
            context.fillText(text, textX, currentY)
            textX += context.measureText(text).width
          } else if (part) {
            // 일반 텍스트
            context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            context.fillText(part, textX, currentY)
            textX += context.measureText(part).width
          }
        })
      } else {
        context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        
        // 긴 텍스트 줄바꿈 처리
        const words = line.split(' ')
        let currentLine = ''
        const maxWidth = width - 100 // 여백을 더 크게 하여 텍스트가 잘리지 않도록
        
        words.forEach((word) => {
          const testLine = currentLine + word + ' '
          const testWidth = context.measureText(testLine).width
          
          if (testWidth > maxWidth && currentLine.length > 0) {
            context.fillText(currentLine.trim(), textX, currentY)
            currentY += lineHeight
            currentLine = word + ' '
          } else {
            currentLine = testLine
          }
        })
        
        if (currentLine.length > 0) {
          context.fillText(currentLine.trim(), textX, currentY)
        }
      }
      
      currentY += lineHeight
    }
  })
  
  // Three.js 텍스처 생성
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  
  return texture
}

// macOS 윈도우 버튼 컴포넌트
function MacOSButtons({ 
  cardWidth, 
  cardHeight,
  groupRef
}: { 
  cardWidth: number
  cardHeight: number
  groupRef: React.RefObject<THREE.Group>
}) {
  // 버튼 위치 계산 (카드 좌측 상단 기준)
  const buttonSize = 0.065  // 크기 감소: 0.08 → 0.065 (약 19% 감소)
  const buttonSpacing = 0.2  // 간격 감소: 0.24 → 0.2 (약 17% 감소)
  const leftMargin = 0.2
  const topMargin = 0.2
  
  const startX = -cardWidth/2 + leftMargin
  const startY = cardHeight/2 - topMargin
  const buttonZ = 0.002 // 고정된 위치 (미묘한 오프셋만)
  
  const buttonPositions = [
    { x: startX, color: '#ff5f57', name: 'close' },                    // 빨간색
    { x: startX + buttonSpacing, color: '#ffbd2e', name: 'minimize' }, // 노란색  
    { x: startX + buttonSpacing * 2, color: '#28ca42', name: 'maximize' } // 초록색
  ]
  
  // 앞면/뒷면에 따른 렌더 순서 제어 (부드러운 해결책)
  const [renderOrder, setRenderOrder] = useState(1)
  
  useFrame(() => {
    if (groupRef.current) {
      // 카드의 현재 회전 상태에서 법선 벡터 계산
      const worldMatrix = new THREE.Matrix4()
      groupRef.current.updateMatrixWorld()
      worldMatrix.copy(groupRef.current.matrixWorld)
      
      // 카드 법선 벡터 (앞면 방향)
      const normalVector = new THREE.Vector3(0, 0, 1)
      normalVector.applyMatrix4(worldMatrix).normalize()
      
      // 카메라 방향 벡터
      const cameraDirection = new THREE.Vector3(0, 0, 1)
      
      // 내적으로 앞면/뒷면 판단하여 렌더 순서 조정
      const dotProduct = normalVector.dot(cameraDirection)
      
      if (dotProduct > 0) {
        // 앞면: 버튼이 카드보다 나중에 렌더링 (위에 표시)
        setRenderOrder(2)
      } else {
        // 뒷면: 버튼이 카드보다 먼저 렌더링 (아래 표시)
        setRenderOrder(0)
      }
    }
  })
  
  return (
    <>
      {buttonPositions.map((button, _index) => (
        <group key={button.name}>
          <mesh 
            position={[button.x, startY, buttonZ]}
            rotation={[Math.PI / 2, 0, 0]}
            renderOrder={renderOrder}
          >
            <cylinderGeometry args={[buttonSize, buttonSize, 0.004, 16]} />
            <meshBasicMaterial
              color={button.color}
              depthTest={false}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

// 마크다운 컨텐츠 컴포넌트
function MarkdownContent({ 
  markdownContent, 
  cardWidth, 
  cardHeight 
}: { 
  markdownContent: string
  cardWidth: number
  cardHeight: number
}) {
  // 텍스처 메모이제이션
  const texture = useMemo(() => {
    if (!markdownContent) return null
    return createMarkdownTexture(markdownContent, 512, 650)
  }, [markdownContent])
  
  if (!texture) return null
  
  return (
    <mesh 
      position={[0, -0.15, 0.003]} // 아래로 조금 내림
      renderOrder={1.5} // 카드 위, 버튼 아래
    >
      <planeGeometry args={[cardWidth * 0.95, cardHeight * 0.95]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        depthTest={false}
      />
    </mesh>
  )
}

// 카드 뒷면 이미지 컴포넌트
function BackfaceImage({ 
  cardWidth: _cardWidth, 
  cardHeight: _cardHeight 
}: { 
  cardWidth: number
  cardHeight: number
}) {
  // butterfly.png 이미지 로드
  const texture = useLoader(THREE.TextureLoader, '/butterfly.png')
  
  return (
    <mesh 
      position={[0, 0, -0.003]} // 카드 뒷면에 배치 (z축 음수)
      rotation={[0, Math.PI, 0]} // 뒷면이므로 180도 회전
      renderOrder={1.5}
    >
      <planeGeometry args={[_cardWidth * 0.3, _cardHeight * 0.2]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        depthTest={false}
      />
    </mesh>
  )
}

// 카드 뒤쪽 실제 백라이트 광원 컴포넌트
function BackLight({ 
  cardWidth: _cardWidth, 
  cardHeight: _cardHeight 
}: { 
  cardWidth: number
  cardHeight: number
}) {
  const backLightRef = useRef<THREE.PointLight>(null!)
  
  // 부드러운 호흡 애니메이션
  useFrame((state) => {
    if (backLightRef.current) {
      // 2초 주기로 부드럽게 펄스하는 광도
      const pulse = Math.sin(state.clock.elapsedTime * Math.PI) * 0.2 + 0.8
      backLightRef.current.intensity = pulse * 1.2
      
      // 위치도 미세하게 움직임 (생동감)
      const sway = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      backLightRef.current.position.x = sway
    }
  })
  
  return (
    <pointLight
      ref={backLightRef}
      position={[0, 0, -2]} // 카드 뒤쪽에 위치
      intensity={1.2}
      distance={8} // 광원 범위
      decay={1.5} // 빛의 감쇠
      color="#f0f8ff" // 아주 연한 차가운 흰색
    />
  )
}

// 실제 물리법칙 기반 고무줄 효과 컴포넌트
function RubberBand({ 
  cardRef,
  cardWidth: _cardWidth,
  cardHeight 
}: { 
  cardRef: React.RefObject<THREE.Group>
  cardWidth: number
  cardHeight: number
}) {
  const topBandRef = useRef<THREE.Mesh>(null!)
  const bottomBandRef = useRef<THREE.Mesh>(null!)
  
  // 물리 시뮬레이션 상태
  const [physics, setPhysics] = useState({
    position: 0,      // 현재 Y 위치
    velocity: 0,      // 속도
    isDragging: false,
    dragStartY: 0,
    springConstant: 0.15,  // 스프링 상수 (k)
    damping: 0.92,         // 감쇠 계수 (0~1)
    mass: 1.0              // 가상 질량
  })
  
  // 고정점 위치 (카메라 시야 내로 조정)
  const anchorTop = 6.5      // 화면 위쪽 (4 → 6.5로 확장)
  const anchorBottom = -6.5  // 화면 아래쪽 (-4 → -6.5로 확장)
  
  // 마우스 이벤트 처리
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      setPhysics(prev => ({
        ...prev,
        isDragging: true,
        dragStartY: event.clientY,
        velocity: 0  // 드래그 시작 시 속도 리셋
      }))
    }
    
    const handleMouseMove = (event: MouseEvent) => {
      if (physics.isDragging) {
        const deltaY = (event.clientY - physics.dragStartY) * -0.008 // 방향 반전 (- 추가)
        const clampedDelta = Math.max(-2.5, Math.min(2.5, deltaY)) // 범위 제한
        
        setPhysics(prev => ({
          ...prev,
          position: clampedDelta
        }))
      }
    }
    
    const handleMouseUp = () => {
      if (physics.isDragging) {
        // 드래그 종료 시 초기 속도 계산 (복원력)
        const restoreForce = -physics.position * physics.springConstant
        const initialVelocity = restoreForce * 0.8 // 초기 속도
        
        setPhysics(prev => ({
          ...prev,
          isDragging: false,
          velocity: initialVelocity
        }))
      }
    }
    
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [physics.isDragging, physics.dragStartY, physics.springConstant])
  
  // 물리 시뮬레이션 업데이트
  useFrame((state, delta) => {
    if (!physics.isDragging && cardRef.current && topBandRef.current && bottomBandRef.current) {
      // 훅의 법칙: F = -kx
      const springForce = -physics.position * physics.springConstant
      
      // 가속도 = 힘 / 질량
      const acceleration = springForce / physics.mass
      
      // 속도 업데이트 (오일러 적분)
      let newVelocity = physics.velocity + acceleration * delta * 60 // 60fps 기준
      
      // 감쇠 적용 (에어 레지스탕스/마찰)
      newVelocity *= physics.damping
      
      // 위치 업데이트
      let newPosition = physics.position + newVelocity * delta * 60
      
      // 극한 범위 제한 (고무줄 파괴 방지)
      newPosition = Math.max(-4, Math.min(4, newPosition))
      
      // 최소 진동 임계값 (미세한 진동 제거)
      if (Math.abs(newPosition) < 0.01 && Math.abs(newVelocity) < 0.01) {
        newPosition = 0
        newVelocity = 0
      }
      
      setPhysics(prev => ({
        ...prev,
        position: newPosition,
        velocity: newVelocity
      }))
    }
    
    // 카드 위치 업데이트
    if (cardRef.current) {
      cardRef.current.position.y = physics.position
    }
    
    // 고무줄 시각적 업데이트
    if (topBandRef.current && bottomBandRef.current) {
      // 카드 연결점 계산
      const cardTop = physics.position + cardHeight/2
      const cardBottom = physics.position - cardHeight/2
      
      // 위쪽 고무줄 (앵커 → 카드 상단)
      const topLength = anchorTop - cardTop
      const topCenter = (anchorTop + cardTop) / 2
      topBandRef.current.position.set(0, topCenter, -0.1) // z축을 카드 뒤로 이동
      topBandRef.current.scale.y = Math.max(0.1, topLength)
      
      // 아래쪽 고무줄 (카드 하단 → 앵커)  
      const bottomLength = cardBottom - anchorBottom
      const bottomCenter = (cardBottom + anchorBottom) / 2
      bottomBandRef.current.position.set(0, bottomCenter, -0.1) // z축을 카드 뒤로 이동
      bottomBandRef.current.scale.y = Math.max(0.1, bottomLength)
      
      // 색상은 회색으로 고정 (색상 변화 로직 제거)
    }
  })
  
  return (
    <group>
      {/* 위쪽 앵커 포인트 (시각적 표시) */}
      <mesh position={[0, anchorTop, -0.1]} renderOrder={-1}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* 아래쪽 앵커 포인트 */}
      <mesh position={[0, anchorBottom, -0.1]} renderOrder={-1}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* 위쪽 고무줄 */}
      <mesh ref={topBandRef} renderOrder={-1}>
        <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
        <meshStandardMaterial 
          color="#808080" 
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      
      {/* 아래쪽 고무줄 */}
      <mesh ref={bottomBandRef} renderOrder={-1}>
        <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
        <meshStandardMaterial 
          color="#808080"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

// 커머스급 재사용 가능한 카드 지오메트리 생성기
function createRoundedCardGeometry(
  width: number, 
  height: number, 
  thickness: number, 
  radius: number
): THREE.ExtrudeGeometry {
  
  // Shape 생성 (2D 윤곽선)
  const shape = new THREE.Shape()
  
  const halfWidth = width / 2
  const halfHeight = height / 2
  
  // 둥근 모서리 카드 경로 생성 (시계방향)
  shape.moveTo(-halfWidth + radius, -halfHeight)
  
  // 하단 가로선
  shape.lineTo(halfWidth - radius, -halfHeight)
  // 우하단 모서리
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius)
  
  // 우측 세로선  
  shape.lineTo(halfWidth, halfHeight - radius)
  // 우상단 모서리
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight)
  
  // 상단 가로선
  shape.lineTo(-halfWidth + radius, halfHeight)
  // 좌상단 모서리
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius)
  
  // 좌측 세로선
  shape.lineTo(-halfWidth, -halfHeight + radius)
  // 좌하단 모서리
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight)
  
  // Extrude 설정 (3D로 확장)
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false, // 베벨 비활성화로 깔끔한 모서리
    curveSegments: 16,   // 곡선 품질 (커머스용 고품질)
  }
  
  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

// 지오메트리 캐싱 시스템 (성능 최적화)
const geometryCache = new Map<string, THREE.ExtrudeGeometry>()

function getCachedGeometry(
  width: number, 
  height: number, 
  thickness: number, 
  radius: number
): THREE.ExtrudeGeometry {
  const key = `${width}-${height}-${thickness}-${radius}`
  
  if (!geometryCache.has(key)) {
    const geometry = createRoundedCardGeometry(width, height, thickness, radius)
    geometryCache.set(key, geometry)
  }
  
  return geometryCache.get(key)!
}

function FloatingCard({ 
  radius = 0.08, 
  width = 3.5, 
  height = 4.5, 
  thickness = 0.001,
  showMacButtons = true,
  markdownContent = ''
}: ThreeCardProps) {
  const cardRef = useRef<THREE.Group>(null!)
  
  // 지오메트리 메모이제이션 (리렌더링 최적화)
  const geometry = useMemo(() => 
    getCachedGeometry(width, height, thickness, radius),
    [width, height, thickness, radius]
  )
  
  // 부드러운 회전 애니메이션
  useFrame((_state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y += 0.005
      // Y축 부유 애니메이션 제거 (고무줄과 충돌 방지)
      // cardRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group 
      ref={cardRef}
      rotation={[0.1, -0.25, -0.05]}
    >
      {/* 커스텀 지오메트리 카드 */}
      <mesh geometry={geometry} renderOrder={1}>
        {/* 백라이트 최적화 글래스모피즘 재질 - 톤업 */}
        <meshPhysicalMaterial
          color="#4a4a4a"      // 더 밝은 회색 (#2a2a2a → #4a4a4a)
          metalness={0.0}      
          roughness={0.02}     
          transparent={true}
          opacity={0.45}       
          transmission={0.85}  
          thickness={0.08}     
          envMapIntensity={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          emissive="#2a2a2a"   // 발광색도 함께 밝게
          emissiveIntensity={0.03} 
          ior={1.52}
          side={THREE.DoubleSide}
          
          // 백라이트 효과를 위한 추가 설정
          attenuationColor="#ffffff"
          attenuationDistance={0.5}
        />
      </mesh>
      
      {/* macOS 윈도우 버튼 */}
      {showMacButtons && (
        <MacOSButtons cardWidth={width} cardHeight={height} groupRef={cardRef} />
      )}
      
      {/* 마크다운 컨텐츠 */}
      {markdownContent && (
        <MarkdownContent 
          markdownContent={markdownContent}
          cardWidth={width}
          cardHeight={height}
        />
      )}
      
      {/* 카드 뒷면 이미지 */}
      <BackfaceImage 
        cardWidth={width}
        cardHeight={height}
      />
      
      {/* 카드 뒤쪽 실제 백라이트 광원 */}
      <BackLight 
        cardWidth={width}
        cardHeight={height}
      />
      
      {/* 고무줄 효과 */}
      <RubberBand 
        cardRef={cardRef}
        cardWidth={width}
        cardHeight={height}
      />
    </group>
  )
}

// 상단 Title/Subtitle 컴포넌트 (3D 씬 위 오버레이)
function TitleSubtitle({ 
  title, 
  subtitle 
}: { 
  title?: string
  subtitle?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  // 1초 후 등장 (카드보다 먼저)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!title && !subtitle) return null
  
  return (
    <div 
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 px-6 py-4 text-center">
        {title && (
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

// 미니멀한 Waitlist 컴포넌트 (3D 노트 하단 중앙)
function MinimalWaitlist() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // 2초 후 등장
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      console.log('Waitlist signup:', email)
    }
  }
  
  if (!isVisible) return null
  
  return (
    <div 
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-4 min-w-[300px]">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for early access"
              className="flex-1 px-3 py-2 bg-black/60 border-0 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-black/80 transition-all"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white hover:bg-white/80 text-black rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg"
            >
              Join Waitlist
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-white text-lg">✓</span>
            <span className="text-white text-sm font-medium">You&apos;re on the waitlist!</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ThreeCard({ 
  radius = 0.08,
  width = 3.5,
  height = 4.5, 
  thickness = 0.001,
  showMacButtons = true,
  markdownContent = '',
  title = '',
  subtitle = ''
}: ThreeCardProps) {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 전체 화면 Canvas */}
      <Canvas
        camera={{ 
          position: [-1, 1, 10.5], 
          fov: 50,
          near: 0.1,
          far: 100
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent' 
        }}
      >
        {/* 다크 모드 글래스모피즘을 위한 조명 설정 */}
        <ambientLight intensity={0.3} color="#404040" />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.6} 
          color="#ffffff"
          castShadow
        />
        <directionalLight 
          position={[-5, -5, 2]} 
          intensity={0.3} 
          color="#6366f1"
        />
        {/* 다크 글래스 효과를 위한 포인트 라이트 */}
        <pointLight position={[3, 3, 3]} intensity={0.4} color="#8b5cf6" />
        <pointLight position={[-3, -3, 2]} intensity={0.3} color="#3b82f6" />
        <pointLight position={[0, 5, 0]} intensity={0.2} color="#ffffff" />
        
        {/* 카드 컴포넌트 */}
        <FloatingCard 
          radius={radius}
          width={width}
          height={height}
          thickness={thickness}
          showMacButtons={showMacButtons}
          markdownContent={markdownContent}
        />
        
        {/* 마우스 인터랙션 */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* 상단 Title/Subtitle 오버레이 */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <TitleSubtitle 
          title={title}
          subtitle={subtitle}
        />
      </div>
      
      {/* 하단 Waitlist 오버레이 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <MinimalWaitlist />
      </div>
    </div>
  )
} 