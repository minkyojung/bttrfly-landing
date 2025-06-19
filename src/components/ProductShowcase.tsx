'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'

// 기존 ThreeCard의 모든 컴포넌트들을 여기로 이동
// (createMarkdownTexture, MacOSButtons, MarkdownContent, BackfaceImage, BackLight, RubberBand 등)

interface ThreeCardProps {
  radius?: number
  width?: number
  height?: number
  thickness?: number
  showMacButtons?: boolean
  markdownContent?: string
}

interface ProductInfo {
  name: string
  price: string
  description: string
  features: string[]
  ctaText: string
}

interface ProductShowcaseProps {
  cardProps?: ThreeCardProps
  productInfo?: ProductInfo
}

// 마크다운을 Canvas 텍스처로 변환하는 함수
function createMarkdownTexture(markdownContent: string, width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  
  const scale = 2
  canvas.width = width * scale
  canvas.height = height * scale
  context.scale(scale, scale)
  
  context.clearRect(0, 0, width, height)
  
  const lines = markdownContent.split('\n')
  let currentY = 50
  const lineHeight = 28
  const leftMargin = 30
  
  lines.forEach((line) => {
    line = line.trim()
    if (!line) {
      currentY += lineHeight * 0.6
      return
    }
    
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
    else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      const isChecked = line.startsWith('- [x]')
      const text = line.replace(/^- \[[x ]\]\s*/, '')
      
      context.fillStyle = '#ffffff'
      
      const checkboxSymbol = isChecked ? '☑ ' : '☐ '
      const maxWidth = width - 100
      
      if (text.includes('**')) {
        let currentY_local = currentY
        let currentX = leftMargin
        
        context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        context.fillText(checkboxSymbol, currentX, currentY_local)
        currentX += context.measureText(checkboxSymbol).width
        
        const parts = text.split('**')
        
        parts.forEach((part, index) => {
          if (!part) return
          
          if (index % 2 === 0) {
            context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
          } else {
            context.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
          }
          
          const words = part.split(' ')
          words.forEach((word, wordIndex) => {
            if (!word) return
            
            const wordWithSpace = word + (wordIndex < words.length - 1 ? ' ' : '')
            const wordWidth = context.measureText(wordWithSpace).width
            
            if (currentX + wordWidth > leftMargin + maxWidth && currentX > leftMargin + context.measureText(checkboxSymbol).width) {
              currentY_local += lineHeight
              currentX = leftMargin + context.measureText(checkboxSymbol).width
            }
            
            context.fillText(wordWithSpace, currentX, currentY_local)
            currentX += wordWidth
          })
        })
        
        currentY = currentY_local + lineHeight
      } else {
        context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        
        const fullText = `${checkboxSymbol}${text}`
        
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
          
          if (wordIndex === words.length - 1 && currentLine.length > 0) {
            context.fillText(currentLine, leftMargin, currentY)
          }
        })
        
        currentY += lineHeight
      }
    }
    else {
      context.fillStyle = '#ffffff'
      let textX = leftMargin
      
      if (line.includes('*')) {
        const parts = line.split(/(\*[^*]+\*|\*\*[^*]+\*\*)/g)
        parts.forEach((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            context.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            const text = part.replace(/\*\*/g, '')
            context.fillText(text, textX, currentY)
            textX += context.measureText(text).width
          } else if (part.startsWith('*') && part.endsWith('*')) {
            context.font = 'italic 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            const text = part.replace(/\*/g, '')
            context.fillText(text, textX, currentY)
            textX += context.measureText(text).width
          } else if (part) {
            context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            context.fillText(part, textX, currentY)
            textX += context.measureText(part).width
          }
        })
      } else {
        context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        
        const words = line.split(' ')
        let currentLine = ''
        const maxWidth = width - 100
        
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
  const buttonSize = 0.065
  const buttonSpacing = 0.2
  const leftMargin = 0.2
  const topMargin = 0.2
  
  const startX = -cardWidth/2 + leftMargin
  const startY = cardHeight/2 - topMargin
  const buttonZ = 0.002
  
  const buttonPositions = [
    { x: startX, color: '#ff5f57', name: 'close' },
    { x: startX + buttonSpacing, color: '#ffbd2e', name: 'minimize' },
    { x: startX + buttonSpacing * 2, color: '#28ca42', name: 'maximize' }
  ]
  
  const [renderOrder, setRenderOrder] = useState(1)
  
  useFrame(() => {
    if (groupRef.current) {
      const worldMatrix = new THREE.Matrix4()
      groupRef.current.updateMatrixWorld()
      worldMatrix.copy(groupRef.current.matrixWorld)
      
      const normalVector = new THREE.Vector3(0, 0, 1)
      normalVector.applyMatrix4(worldMatrix).normalize()
      
      const cameraDirection = new THREE.Vector3(0, 0, 1)
      
      const dotProduct = normalVector.dot(cameraDirection)
      
      if (dotProduct > 0) {
        setRenderOrder(2)
      } else {
        setRenderOrder(0)
      }
    }
  })
  
  return (
    <>
      {buttonPositions.map((button) => (
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
  const texture = useMemo(() => {
    if (!markdownContent) return null
    return createMarkdownTexture(markdownContent, 512, 650)
  }, [markdownContent])
  
  if (!texture) return null
  
  return (
    <mesh 
      position={[0, -0.15, 0.003]}
      renderOrder={1.5}
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
  const texture = useLoader(THREE.TextureLoader, '/butterfly.png')
  
  return (
    <mesh 
      position={[0, 0, -0.003]}
      rotation={[0, Math.PI, 0]}
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
function BackLight() {
  const backLightRef = useRef<THREE.PointLight>(null!)
  
  useFrame((state) => {
    if (backLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * Math.PI) * 0.2 + 0.8
      backLightRef.current.intensity = pulse * 1.2
      
      const sway = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      backLightRef.current.position.x = sway
    }
  })
  
  return (
    <pointLight
      ref={backLightRef}
      position={[0, 0, -2]}
      intensity={1.2}
      distance={8}
      decay={1.5}
      color="#f0f8ff"
    />
  )
}

// 실제 물리법칙 기반 고무줄 효과 컴포넌트
function RubberBand({ 
  cardRef,
  cardHeight 
}: { 
  cardRef: React.RefObject<THREE.Group>
  cardHeight: number
}) {
  const topBandRef = useRef<THREE.Mesh>(null!)
  const bottomBandRef = useRef<THREE.Mesh>(null!)
  
  const [physics, setPhysics] = useState({
    position: 0,
    velocity: 0,
    isDragging: false,
    dragStartY: 0,
    springConstant: 0.15,
    damping: 0.92,
    mass: 1.0
  })
  
  const anchorTop = 6.5
  const anchorBottom = -6.5
  
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      setPhysics(prev => ({
        ...prev,
        isDragging: true,
        dragStartY: event.clientY,
        velocity: 0
      }))
    }
    
    const handleMouseMove = (event: MouseEvent) => {
      if (physics.isDragging) {
        const deltaY = (event.clientY - physics.dragStartY) * -0.008
        const clampedDelta = Math.max(-2.5, Math.min(2.5, deltaY))
        
        setPhysics(prev => ({
          ...prev,
          position: clampedDelta
        }))
      }
    }
    
    const handleMouseUp = () => {
      if (physics.isDragging) {
        const restoreForce = -physics.position * physics.springConstant
        const initialVelocity = restoreForce * 0.8
        
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
  }, [physics.isDragging, physics.dragStartY, physics.springConstant, physics.position])
  
  useFrame((state, delta) => {
    if (!physics.isDragging && cardRef.current && topBandRef.current && bottomBandRef.current) {
      const springForce = -physics.position * physics.springConstant
      
      const acceleration = springForce / physics.mass
      
      let newVelocity = physics.velocity + acceleration * delta * 60
      
      newVelocity *= physics.damping
      
      let newPosition = physics.position + newVelocity * delta * 60
      
      newPosition = Math.max(-4, Math.min(4, newPosition))
      
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
    
    if (cardRef.current) {
      cardRef.current.position.y = physics.position
    }
    
    if (topBandRef.current && bottomBandRef.current) {
      const cardTop = physics.position + cardHeight/2
      const cardBottom = physics.position - cardHeight/2
      
      const topLength = anchorTop - cardTop
      const topCenter = (anchorTop + cardTop) / 2
      topBandRef.current.position.set(0, topCenter, -0.1)
      topBandRef.current.scale.y = Math.max(0.1, topLength)
      
      const bottomLength = cardBottom - anchorBottom
      const bottomCenter = (cardBottom + anchorBottom) / 2
      bottomBandRef.current.position.set(0, bottomCenter, -0.1)
      bottomBandRef.current.scale.y = Math.max(0.1, bottomLength)
    }
  })
  
  return (
    <group>
      <mesh position={[0, anchorTop, -0.1]} renderOrder={-1}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      <mesh position={[0, anchorBottom, -0.1]} renderOrder={-1}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      <mesh ref={topBandRef} renderOrder={-1}>
        <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
        <meshStandardMaterial 
          color="#808080" 
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      
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

// 카드 지오메트리 생성
function createRoundedCardGeometry(
  width: number, 
  height: number, 
  thickness: number, 
  radius: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  
  const halfWidth = width / 2
  const halfHeight = height / 2
  
  shape.moveTo(-halfWidth + radius, -halfHeight)
  
  shape.lineTo(halfWidth - radius, -halfHeight)
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius)
  
  shape.lineTo(halfWidth, halfHeight - radius)
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight)
  
  shape.lineTo(-halfWidth + radius, halfHeight)
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius)
  
  shape.lineTo(-halfWidth, -halfHeight + radius)
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight)
  
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 16,
  }
  
  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

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

// 3D 카드 컴포넌트
function FloatingCard({ 
  radius = 0.08, 
  width = 3.5, 
  height = 4.5, 
  thickness = 0.001,
  showMacButtons = true,
  markdownContent = ''
}: ThreeCardProps) {
  const cardRef = useRef<THREE.Group>(null!)
  
  const geometry = useMemo(() => 
    getCachedGeometry(width, height, thickness, radius),
    [width, height, thickness, radius]
  )
  
  useFrame(() => {
    if (cardRef.current) {
      cardRef.current.rotation.y += 0.005
    }
  })

  return (
    <group 
      ref={cardRef}
      rotation={[0.1, -0.25, -0.05]}
    >
      <mesh geometry={geometry} renderOrder={1}>
        <meshPhysicalMaterial
          color="#4a4a4a"
          metalness={0.0}      
          roughness={0.02}     
          transparent={true}
          opacity={0.45}       
          transmission={0.85}  
          thickness={0.08}     
          envMapIntensity={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          emissive="#2a2a2a"
          emissiveIntensity={0.03} 
          ior={1.52}
          side={THREE.DoubleSide}
          attenuationColor="#ffffff"
          attenuationDistance={0.5}
        />
      </mesh>
      
      {showMacButtons && (
        <MacOSButtons cardWidth={width} cardHeight={height} groupRef={cardRef} />
      )}
      
      {markdownContent && (
        <MarkdownContent 
          markdownContent={markdownContent}
          cardWidth={width}
          cardHeight={height}
        />
      )}
      
      <BackfaceImage 
        cardWidth={width}
        cardHeight={height}
      />
      
      <BackLight />
      
      <RubberBand 
        cardRef={cardRef}
        cardHeight={height}
      />
    </group>
  )
}

// 좌측 3D 카드 패널
function LeftPanel({ cardProps }: { cardProps: ThreeCardProps }) {
  return (
    <div className="w-1/2 h-full pr-2">
      <Canvas
        camera={{ 
          position: [-1, 1, 10], // 8 → 10으로 축소
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
        <pointLight position={[3, 3, 3]} intensity={0.4} color="#8b5cf6" />
        <pointLight position={[-3, -3, 2]} intensity={0.3} color="#3b82f6" />
        <pointLight position={[0, 5, 0]} intensity={0.2} color="#ffffff" />
        
        <FloatingCard {...cardProps} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

// 우측 제품 정보 카드 패널
function RightPanel({ productInfo }: { productInfo: ProductInfo }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])
  
  // 다운로드 핸들러 함수 추가
  const handleDownload = () => {
    const downloadUrl = 'https://minkyojung.github.io/bttrfly-updates/downloads/Bttrfly_1.0.1_112.dmg';
    
    // 새 창에서 다운로드 링크 열기 (일부 브라우저에서 더 안정적)
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Bttrfly_1.0.1_112.dmg'; // 다운로드 파일명 지정
    link.target = '_blank'; // 새 탭에서 열기
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-1/2 h-full flex items-center justify-center pl-1 pr-8 py-8">
      <div 
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}
      >
        <div 
          className="bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-6 max-w-xs w-full"
          style={{ 
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.02em'
          }}
        >
          {/* 제품명 */}
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
            {productInfo.name}
          </h1>
          
          {/* 가격 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-white/60 line-through">
                $5.99/month
              </span>
            </div>
            <span className="text-3xl font-bold text-white">
              {productInfo.price}
            </span>
          </div>
          
          {/* 설명 */}
          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            {productInfo.description}
          </p>
          
          {/* 특징 리스트 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Features
            </h3>
            <ul className="space-y-2">
              {productInfo.features.map((feature, _index) => (
                <li key={_index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-white/90 text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* CTA 버튼에 onClick 핸들러 추가 */}
          <button 
            onClick={handleDownload}
            className="w-full bg-white hover:bg-white/90 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg text-sm"
          >
            {productInfo.ctaText}
          </button>
          
          {/* 보조 정보 */}
          <p className="text-xs text-white/60 text-center mt-3">
            No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}

// 메인 ProductShowcase 컴포넌트
export default function ProductShowcase({
  cardProps = {
    radius: 0.08,
    width: 3.5,
    height: 4.5,
    thickness: 0.001,
    showMacButtons: true,
    markdownContent: `# Quick Guide for Bttrfly 🦋

## Bttrfly is a local‑first Markdown notebook.

#### Get started
- [ ] **New note:** Press ⌘N or click the **＋** button  
- [ ] **Write freely:** Every keystroke is auto‑saved  
- [ ] **Already using Obsidian?** Add that folder to the **'Search Panel'**  
- [ ] **Quick switch:** Press ⌘P to find any note instantly  
- [ ] **Settings:** Press ⌘, to customize the app

### Now, hit ⌘N or ⌘P to start journey!`
  },
  productInfo = {
    name: "Bttrfly Note",
    price: "$0.00",
    description: "Local-first Markdown notebook for seamless writing",
    features: [
      "Local-first",
      "Add your existing Obsidian vault",
      "Always-on-top of your screen"
    ],
    ctaText: "Download for Mac"
  }
}: ProductShowcaseProps) {
  return (
    <div className="w-full h-screen bg-black flex">
      <LeftPanel cardProps={cardProps} />
      <RightPanel productInfo={productInfo} />
    </div>
  )
} 