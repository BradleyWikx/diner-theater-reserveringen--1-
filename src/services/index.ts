// Central export point for all Firebase services
// Provides clean imports for service classes

// Import and re-export all services from the main firebase service file
export {
  ShowEventsService,
  ReservationsService,
  WaitingListService,
  WaitlistService,
  InternalEventsService,
  TablesService,
  MenuItemsService,
  MerchandiseService,
  CustomersService,
  ConfigService,
  TheaterVouchersService,
  BookingApprovalsService,
  PromoCodesService,
  NotificationsService,
  AdminLogsService,
  FirebaseService
} from './firebaseService';

// Re-export auth functions from firebase config
export {
  loginAdmin,
  logoutAdmin,
  auth,
  db
} from '../firebase/config';
