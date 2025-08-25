import React, { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isSmallMobile: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  viewportWidth: number;
  viewportHeight: number;
}

export const useMobile = (): MobileDetection => {
  const [mobileState, setMobileState] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isSmallMobile: false,
    isTouchDevice: false,
    orientation: 'portrait',
    viewportWidth: 0,
    viewportHeight: 0
  });

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           (navigator as any).msMaxTouchPoints > 0;

      setMobileState({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isSmallMobile: width <= 480,
        isTouchDevice,
        orientation: width > height ? 'landscape' : 'portrait',
        viewportWidth: width,
        viewportHeight: height
      });
    };

    // Initial check
    checkDeviceType();

    // Listen for resize and orientation changes
    window.addEventListener('resize', checkDeviceType);
    window.addEventListener('orientationchange', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
      window.removeEventListener('orientationchange', checkDeviceType);
    };
  }, []);

  return mobileState;
};

// Touch gestures hook
interface TouchGestures {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: TouchGestures) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setTouchStart(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scrolling during gesture recognition
    if (touchStart) {
      e.preventDefault();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove
  };
};

// Viewport utilities
export const getViewportInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.innerWidth / window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    isPortrait: window.innerHeight > window.innerWidth
  };
};

// Safe area utilities for mobile browsers
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      // Get CSS custom properties for safe area insets
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};
