// Date utilities
export { 
    getDaysInMonth, 
    formatDateToNL, 
    formatDate, 
    getWeekRange,
    getShowTimes
} from './utilities';

// Mobile utilities
export {
    mobileViewportFix,
    preventDoubleTabZoom,
    ensureViewportMeta,
    optimizeTouchActions,
    initMobileOptimizations,
    isMobileDevice,
    isTouchDevice,
    getDevicePixelRatio,
    isStandaloneMode,
    handleSafeAreaInsets
} from './mobileUtils';

// Text utilities
export { 
    slugify, 
    sanitizeInput 
} from './utilities';

// Validation utilities
export { 
    validateEmail, 
    validatePhoneNumber, 
    validatePostalCode 
} from './utilities';

// Voucher utilities
export { 
    generateVoucherCode, 
    calculateExpiryDate, 
    isVoucherExpired, 
    getVoucherStatus,
    validateVoucherForUse, 
    extendVoucherExpiry 
} from './utilities';

// Performance utilities
export { 
    debounce, 
    throttle 
} from './utilities';

// Export all utilities as a group
export * from './utilities';
