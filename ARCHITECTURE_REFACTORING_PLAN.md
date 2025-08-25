# 🏗️ Architecture Refactoring Plan - Step by Step

## Current State
- **File**: `index.tsx` 
- **Size**: 8,659 lines 
- **Issue**: Monolithic component with everything in one file

## Identified Components to Extract (in order):

### Phase 1: Calendar Components
- ✅ **CalendarPopover** (line 256) → `src/components/calendar/CalendarPopover.tsx` (already exists)
- ✅ **Calendar** (line 345) → `src/components/calendar/Calendar.tsx` (already exists)  
- ✅ **CalendarLegend** (line 469) → `src/components/calendar/CalendarLegend.tsx` (already exists)

### Phase 2: Modal Components  
- ✅ **AddShowModal** (line 490) → `src/components/modals/AddShowModal.tsx` (already exists)
- **WaitingListForm** (line 553) → `src/components/forms/WaitingListForm.tsx`
- **BulkDeleteModal** (line 2286) → `src/components/modals/BulkDeleteModal.tsx`
- **MultiSelectActions** (line 2345) → `src/components/modals/MultiSelectActions.tsx`
- **PrintableListModal** (line 1898) → `src/components/modals/PrintableListModal.tsx`

### Phase 3: Shared Components
- **QuantityStepper** (line 775) → `src/components/shared/QuantityStepper.tsx` (already exists)
- **Pagination** (line 2497) → `src/components/shared/Pagination.tsx` (already exists)
- **WizardProgress** (line 1582) → `src/components/shared/WizardProgress.tsx`
- **DynamicStyles** (line 769) → `src/components/shared/DynamicStyles.tsx`

### Phase 4: Booking System Components
- **BookingSummary** (line 794) → `src/components/booking/BookingSummary.tsx`
- **BookingSummarySidebar** (line 859) → `src/components/booking/BookingSummarySidebar.tsx`
- **MobileBookingSummary** (line 865) → `src/components/booking/MobileBookingSummary.tsx`
- **ReservationWizard** (line 894) → `src/components/booking/ReservationWizard.tsx`
- **ShowSummary** (line 1600) → `src/components/booking/ShowSummary.tsx`

### Phase 5: Admin View Components
- **AdminDayDetails** (line 1656) → `src/components/views/AdminDayDetails.tsx`
- **AdminCalendarView** (line 2041) → `src/components/views/AdminCalendarView.tsx`
- **AdminReservationsView** (line 2516) → `src/components/views/AdminReservationsView.tsx`
- **AdminCustomersView** (line 2838) → `src/components/views/AdminCustomersView.tsx`
- **CustomerDetailView** (line 3176) → `src/components/views/CustomerDetailView.tsx`
- **AdminApprovalsView** (line 3228) → `src/components/views/AdminApprovalsView.tsx`
- **AdminWaitlistView** (line 3423) → `src/components/views/AdminWaitlistView.tsx`

### Phase 6: Management Components
- **TheaterVoucherManagement** (line 3599) → `src/components/management/TheaterVoucherManagement.tsx`

### Phase 7: Hooks & Utilities
- **usePersistentState** (line 173) → `src/hooks/usePersistentState.ts`
- **usePagination** (line 2474) → `src/hooks/usePagination.ts`
- **useAnalyticsData** (line 4132) → `src/hooks/useAnalyticsData.ts`
- **initializeFirebaseCollections** (line 71) → `src/utils/initializeFirebaseCollections.ts`
- **getShowColorClass** (line 698) → `src/utils/showUtils.ts`
- **getShowLegend** (line 745) → `src/utils/showUtils.ts`

### Phase 8: Main App Structure
- **AppContent** (line 8248) → `src/components/AppContent.tsx`
- Clean up main **App** component (line 9078)

## Current Progress: 
- ✅ Mobile Responsiveness Complete
- ✅ **Phase 2: Modal Components COMPLETE** (458 lines removed)
  - ✅ WaitingListForm → `src/components/forms/WaitingListForm.tsx`
  - ✅ BulkDeleteModal → `src/components/modals/BulkDeleteModal.tsx` 
  - ✅ MultiSelectActions → `src/components/modals/MultiSelectActions.tsx`
  - ✅ PrintableListModal → `src/components/modals/PrintableListModal.tsx`
- 🚀 **Starting Phase 3: Shared Components**

## File Size Progress:
- **Started**: 8,659 lines
- **Current**: 8,201 lines  
- **Reduced by**: 458 lines (5.3% reduction)

## Next Steps:
1. Extract WaitingListForm component
2. Extract BulkDeleteModal component  
3. Extract MultiSelectActions component
4. Extract PrintableListModal component
5. Update imports and ensure functionality
