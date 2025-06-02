'use client';

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    const updateFavicon = () => {
      // 시스템 다크모드 + 로컬 테마 설정 체크
      const isDarkMode = 
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
      
      // 기존 favicon 링크들 찾기
      const favicons = document.querySelectorAll("link[rel*='icon']");
      
      // 모든 favicon 제거
      favicons.forEach(favicon => favicon.remove());
      
      // 새로운 favicon 추가 (SVG 사용)
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/svg+xml';
      // 다크모드일 때: 라이트 아이콘(흰색), 라이트모드일 때: 다크 아이콘(검은색)
      newFavicon.href = isDarkMode ? '/icon-light.svg' : '/icon-dark.svg';
      document.head.appendChild(newFavicon);
      
      // PNG fallback 추가 (SVG 지원 안 되는 브라우저용)
      const fallbackFavicon = document.createElement('link');
      fallbackFavicon.rel = 'icon';
      fallbackFavicon.type = 'image/png';
      fallbackFavicon.href = '/butterfly.png'; // 기본 PNG 파일
      document.head.appendChild(fallbackFavicon);
      
      // Apple 터치 아이콘 (PNG 사용)
      const appleFavicon = document.createElement('link');
      appleFavicon.rel = 'apple-touch-icon';
      appleFavicon.href = '/butterfly.png';
      document.head.appendChild(appleFavicon);
    };

    // 초기 favicon 설정
    updateFavicon();

    // 다크모드 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateFavicon();
    
    // 이벤트 리스너들
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // DOM 변경 감지 (테마 클래스 변경)
    const observer = new MutationObserver(handleChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 로컬스토리지 변경 감지
    window.addEventListener('storage', handleChange);

    // 정리 함수
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      observer.disconnect();
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  return null;
} 