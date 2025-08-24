// Firebase Data Migration Utility
import { firebaseService } from '../../firebase/services/firebaseService';
import { 
  ShowEvent, 
  Reservation, 
  WaitingListEntry, 
  InternalEvent, 
  AppConfig,
  TheaterVoucher
} from '../../types/types';

export class DataMigrationService {
  
  // 🔄 MIGRATE LOCAL DATA TO FIREBASE
  async migrateLocalDataToFirebase(localData: {
    shows?: ShowEvent[];
    reservations?: Reservation[];
    waitingList?: WaitingListEntry[];
    internalEvents?: InternalEvent[];
    config?: AppConfig;
    vouchers?: TheaterVoucher[];
  }): Promise<{ success: boolean; errors: string[] }> {
    
    const errors: string[] = [];
    
    try {
      console.log('🚀 Starting Firebase migration...');
      
      // Migrate Shows
      if (localData.shows && localData.shows.length > 0) {
        console.log(`📅 Migrating ${localData.shows.length} shows...`);
        try {
          await this.migrateShows(localData.shows);
          console.log('✅ Shows migrated successfully');
        } catch (error) {
          const errorMsg = `Failed to migrate shows: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      // Migrate Reservations
      if (localData.reservations && localData.reservations.length > 0) {
        console.log(`🎫 Migrating ${localData.reservations.length} reservations...`);
        try {
          await this.migrateReservations(localData.reservations);
          console.log('✅ Reservations migrated successfully');
        } catch (error) {
          const errorMsg = `Failed to migrate reservations: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      // Migrate Waiting List
      if (localData.waitingList && localData.waitingList.length > 0) {
        console.log(`📋 Migrating ${localData.waitingList.length} waiting list entries...`);
        try {
          await this.migrateWaitingList(localData.waitingList);
          console.log('✅ Waiting list migrated successfully');
        } catch (error) {
          const errorMsg = `Failed to migrate waiting list: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      // Migrate Internal Events
      if (localData.internalEvents && localData.internalEvents.length > 0) {
        console.log(`🎭 Migrating ${localData.internalEvents.length} internal events...`);
        try {
          await this.migrateInternalEvents(localData.internalEvents);
          console.log('✅ Internal events migrated successfully');
        } catch (error) {
          const errorMsg = `Failed to migrate internal events: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      // Migrate Theater Vouchers
      if (localData.vouchers && localData.vouchers.length > 0) {
        console.log(`🎫 Migrating ${localData.vouchers.length} theater vouchers...`);
        try {
          await this.migrateTheaterVouchers(localData.vouchers);
          console.log('✅ Theater vouchers migrated successfully');
        } catch (error) {
          const errorMsg = `Failed to migrate theater vouchers: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      // Migrate Config (should be last)
      if (localData.config) {
        console.log('⚙️ Migrating app configuration...');
        try {
          await this.migrateConfig(localData.config);
          console.log('✅ Configuration migrated successfully');
        } catch (error) {
          const errorMsg = `Failed to migrate config: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      if (errors.length === 0) {
        console.log('🎉 Migration completed successfully!');
        return { success: true, errors: [] };
      } else {
        console.log(`⚠️ Migration completed with ${errors.length} errors`);
        return { success: false, errors };
      }
      
    } catch (error) {
      const errorMsg = `Migration failed: ${error}`;
      console.error('💥', errorMsg);
      return { success: false, errors: [errorMsg, ...errors] };
    }
  }
  
  private async migrateShows(shows: ShowEvent[]): Promise<void> {
    // Group shows by batches to avoid overwhelming Firebase
    const batchSize = 10;
    for (let i = 0; i < shows.length; i += batchSize) {
      const batch = shows.slice(i, i + batchSize);
      const showsWithoutId = batch.map(show => {
        const { id, ...showData } = show;
        return showData;
      });
      
      await firebaseService.shows.addMultipleShows(showsWithoutId);
      console.log(`✅ Migrated shows batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(shows.length / batchSize)}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  private async migrateReservations(reservations: Reservation[]): Promise<void> {
    for (const reservation of reservations) {
      const { id, ...reservationData } = reservation;
      await firebaseService.reservations.addReservation(reservationData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  private async migrateWaitingList(waitingList: WaitingListEntry[]): Promise<void> {
    for (const entry of waitingList) {
      const { id, ...entryData } = entry;
      await firebaseService.waitingList.addWaitingListEntry(entryData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  private async migrateInternalEvents(internalEvents: InternalEvent[]): Promise<void> {
    for (const event of internalEvents) {
      const { id, ...eventData } = event;
      await firebaseService.internalEvents.addInternalEvent(eventData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  private async migrateTheaterVouchers(vouchers: TheaterVoucher[]): Promise<void> {
    for (const voucher of vouchers) {
      const { id, ...voucherData } = voucher;
      await firebaseService.vouchers.addVoucher(voucherData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  private async migrateConfig(config: AppConfig): Promise<void> {
    await firebaseService.config.initializeConfig(config);
  }
  
  // 🔍 DATA VALIDATION UTILITIES
  async validateMigration(): Promise<{
    isValid: boolean;
    summary: {
      shows: number;
      reservations: number;
      waitingList: number;
      internalEvents: number;
      vouchers: number;
      hasConfig: boolean;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const summary = {
      shows: 0,
      reservations: 0,
      waitingList: 0,
      internalEvents: 0,
      vouchers: 0,
      hasConfig: false
    };
    
    try {
      // Validate Shows
      const shows = await firebaseService.shows.getAllShows();
      summary.shows = shows.length;
      
      // Validate Reservations
      const reservations = await firebaseService.reservations.getAllReservations();
      summary.reservations = reservations.length;
      
      // Validate Waiting List
      const waitingList = await firebaseService.waitingList.getAllWaitingList();
      summary.waitingList = waitingList.length;
      
      // Validate Internal Events
      const internalEvents = await firebaseService.internalEvents.getAllInternalEvents();
      summary.internalEvents = internalEvents.length;
      
      // Validate Vouchers
      const vouchers = await firebaseService.vouchers.getAllVouchers();
      summary.vouchers = vouchers.length;
      
      // Validate Config
      const config = await firebaseService.config.getConfig();
      summary.hasConfig = config !== null;
      
      if (!summary.hasConfig) {
        errors.push('No app configuration found in Firebase');
      }
      
    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }
    
    return {
      isValid: errors.length === 0,
      summary,
      errors
    };
  }
  
  // 🧹 CLEANUP UTILITIES
  async clearAllFirebaseData(): Promise<void> {
    console.log('⚠️ Clearing all Firebase data...');
    
    try {
      // Clear shows
      const shows = await firebaseService.shows.getAllShows();
      for (const show of shows) {
        await firebaseService.shows.deleteShow(show.id);
      }
      
      // Clear reservations
      const reservations = await firebaseService.reservations.getAllReservations();
      for (const reservation of reservations) {
        await firebaseService.reservations.deleteReservation(reservation.id);
      }
      
      // Clear waiting list
      const waitingList = await firebaseService.waitingList.getAllWaitingList();
      for (const entry of waitingList) {
        await firebaseService.waitingList.deleteWaitingListEntry(entry.id);
      }
      
      // Clear internal events
      const internalEvents = await firebaseService.internalEvents.getAllInternalEvents();
      for (const event of internalEvents) {
        await firebaseService.internalEvents.deleteInternalEvent(event.id);
      }
      
      // Clear vouchers
      const vouchers = await firebaseService.vouchers.getAllVouchers();
      for (const voucher of vouchers) {
        await firebaseService.vouchers.deleteVoucher(voucher.id);
      }
      
      console.log('🧹 Firebase data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing Firebase data:', error);
      throw error;
    }
  }
  
  // 💾 BACKUP UTILITIES
  async createFirebaseBackup(): Promise<{
    shows: ShowEvent[];
    reservations: Reservation[];
    waitingList: WaitingListEntry[];
    internalEvents: InternalEvent[];
    config: AppConfig | null;
    vouchers: TheaterVoucher[];
    timestamp: string;
  }> {
    console.log('📦 Creating Firebase backup...');
    
    try {
      const [shows, reservations, waitingList, internalEvents, config, vouchers] = await Promise.all([
        firebaseService.shows.getAllShows(),
        firebaseService.reservations.getAllReservations(),
        firebaseService.waitingList.getAllWaitingList(),
        firebaseService.internalEvents.getAllInternalEvents(),
        firebaseService.config.getConfig(),
        firebaseService.vouchers.getAllVouchers()
      ]);
      
      const backup = {
        shows,
        reservations,
        waitingList,
        internalEvents,
        config,
        vouchers,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Firebase backup created successfully');
      return backup;
    } catch (error) {
      console.error('❌ Error creating Firebase backup:', error);
      throw error;
    }
  }
  
  // 📊 MIGRATION REPORT
  generateMigrationReport(localData: any, migrationResult: { success: boolean; errors: string[] }): string {
    const report = `
🎭 FIREBASE MIGRATION REPORT
==============================
Migration Date: ${new Date().toLocaleString()}
Status: ${migrationResult.success ? '✅ SUCCESS' : '❌ FAILED'}

📊 DATA SUMMARY:
- Shows: ${localData.shows?.length || 0}
- Reservations: ${localData.reservations?.length || 0}
- Waiting List: ${localData.waitingList?.length || 0}
- Internal Events: ${localData.internalEvents?.length || 0}
- Theater Vouchers: ${localData.vouchers?.length || 0}
- Configuration: ${localData.config ? '✅ Present' : '❌ Missing'}

${migrationResult.errors.length > 0 ? `
❌ ERRORS:
${migrationResult.errors.map(error => `- ${error}`).join('\n')}
` : ''}

🔧 NEXT STEPS:
${migrationResult.success ? 
`1. Validate data in Firebase console
2. Test app functionality with Firebase backend
3. Monitor Firebase usage and costs
4. Set up Firebase security rules
5. Configure Firebase Functions for automated tasks` :
`1. Review and fix the errors listed above
2. Ensure Firebase project is properly configured
3. Check network connectivity
4. Retry migration after fixing issues`}

==============================
    `.trim();
    
    return report;
  }
}

// Export singleton instance
export const migrationService = new DataMigrationService();
