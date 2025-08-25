// Mobile viewport utilities
export const mobileViewportFix = () => {
  // Fix for mobile browsers where 100vh doesn't account for browser UI
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Initial set
  setVH();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100); // Delay to account for mobile browser UI changes
  });
  
  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
  };
};

// Prevent zoom on double tap for better mobile experience
export const preventDoubleTabZoom = () => {
  let lastTouchEnd = 0;
  
  const handleTouchEnd = (event: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  };
  
  document.addEventListener('touchend', handleTouchEnd, false);
  
  return () => {
    document.removeEventListener('touchend', handleTouchEnd);
  };
};

// Add meta viewport tag for proper mobile scaling
export const ensureViewportMeta = () => {
  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  
  // Set optimal viewport settings
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
};

// Add touch-action CSS to prevent unwanted gestures
export const optimizeTouchActions = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Prevent pull-to-refresh on mobile */
    body {
      overscroll-behavior-y: contain;
    }
    
    /* Optimize touch actions */
    .scrollable {
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    
    .draggable {
      touch-action: none;
    }
    
    .pan-x {
      touch-action: pan-x;
    }
    
    .pan-y {
      touch-action: pan-y;
    }
    
    /* Prevent text selection on touch interfaces */
    .no-select {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    /* Improve button responsiveness */
    button, .btn, [role="button"] {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  
  document.head.appendChild(style);
};

// Initialize all mobile optimizations
export const initMobileOptimizations = () => {
  ensureViewportMeta();
  optimizeTouchActions();
  
  const cleanupVH = mobileViewportFix();
  const cleanupZoom = preventDoubleTabZoom();
  
  // Return cleanup function
  return () => {
    cleanupVH();
    cleanupZoom();
  };
};

// Detect if user is on a mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if device supports touch
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get device pixel ratio for high-DPI screens
export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1;
};

// Check if device is in standalone mode (PWA)
export const isStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// Handle safe area insets
export const handleSafeAreaInsets = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Apply safe area insets to main containers */
    .safe-area-top {
      padding-top: var(--safe-area-inset-top);
    }
    
    .safe-area-bottom {
      padding-bottom: var(--safe-area-inset-bottom);
    }
    
    .safe-area-left {
      padding-left: var(--safe-area-inset-left);
    }
    
    .safe-area-right {
      padding-right: var(--safe-area-inset-right);
    }
    
    .safe-area-all {
      padding-top: var(--safe-area-inset-top);
      padding-right: var(--safe-area-inset-right);
      padding-bottom: var(--safe-area-inset-bottom);
      padding-left: var(--safe-area-inset-left);
    }
    
    /* Fixed positioned elements */
    .fixed-header {
      top: var(--safe-area-inset-top);
    }
    
    .fixed-footer {
      bottom: var(--safe-area-inset-bottom);
    }
    
    /* Full height containers accounting for safe areas */
    .full-height-safe {
      height: calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom));
      height: calc(var(--vh, 1vh) * 100 - var(--safe-area-inset-top) - var(--safe-area-inset-bottom));
    }
  `;
  
  document.head.appendChild(style);
};
