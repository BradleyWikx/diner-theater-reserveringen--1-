// Firebase Test Component
import React, { useState, useEffect } from 'react';
import { useFirebase, useFirebaseStatus } from '../providers/FirebaseProvider';

const FirebaseTest: React.FC = () => {
  const { firebaseData, migrateLocalData, validateMigration, createBackup } = useFirebase();
  const { status, isOnline, error } = useFirebaseStatus();
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Test adding a sample show
  const testAddShow = async () => {
    try {
      setIsLoading(true);
      setTestMessage('Adding test show...');
      
      const testShow = {
        date: '2025-09-01',
        name: 'Firebase Test Show',
        type: 'Test',
        capacity: 100,
        isClosed: false
      };
      
      await firebaseData.shows.addShow(testShow, ['2025-09-01']);
      setTestMessage('✅ Test show added successfully!');
    } catch (error) {
      setTestMessage(`❌ Error adding test show: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test migration functionality
  const testMigration = async () => {
    try {
      setIsLoading(true);
      setTestMessage('Testing migration...');
      
      const sampleLocalData = {
        shows: [{
          id: 'test-1',
          date: '2025-09-15',
          name: 'Migration Test Show',
          type: 'Test',
          capacity: 50,
          isClosed: false
        }],
        config: {
          showNames: [],
          showTypes: [{
            id: 'test-type',
            name: 'Test Type',
            archived: false,
            defaultCapacity: 50,
            priceStandard: 25,
            pricePremium: 35
          }],
          capSlogans: ['Test Firebase!'],
          merchandise: [],
          merchandisePackages: [],
          borrelEvents: [],
          enhancedMerchandise: [],
          shopMerchandise: [],
          shopBundles: [],
          shopCategories: [],
          wizardLayout: [],
          shopConfiguration: {
            displaySettings: {
              itemsPerPage: 12,
              gridColumns: { mobile: 1, tablet: 2, desktop: 3 },
              showPriceComparison: true,
              showStockLevels: true,
              enableWishlist: false,
              enableReviews: false,
              enableSocialSharing: false,
              defaultSortBy: 'featured' as const
            },
            categories: [],
            filterOptions: {
              enablePriceFilter: true,
              priceRanges: [],
              enableCategoryFilter: true,
              enableBrandFilter: false,
              enableRatingFilter: true,
              enableStockFilter: true
            },
            featuredSettings: {
              maxFeaturedItems: 6,
              autoRotateFeatured: false,
              featuredBadgeText: 'Featured',
              featuredBadgeColor: '#ff6b6b'
            }
          },
          promoCodes: [],
          theaterVouchers: [],
          bookingSettings: {
            minGuests: 1,
            maxGuests: 12,
            bookingCutoffHours: 2
          },
          prices: {
            preShowOrAfterParty: 8,
            cap: 15
          }
        }
      };
      
      const result = await migrateLocalData(sampleLocalData);
      
      if (result.success) {
        setTestMessage('✅ Migration test completed successfully!');
      } else {
        setTestMessage(`⚠️ Migration test completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setTestMessage(`❌ Migration test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test validation
  const testValidation = async () => {
    try {
      setIsLoading(true);
      setTestMessage('Validating Firebase data...');
      
      const validation = await validateMigration();
      
      const message = `
📊 Validation Results:
- Shows: ${validation.summary.shows}
- Reservations: ${validation.summary.reservations}
- Waiting List: ${validation.summary.waitingList}
- Internal Events: ${validation.summary.internalEvents}
- Vouchers: ${validation.summary.vouchers}
- Has Config: ${validation.summary.hasConfig ? '✅' : '❌'}
- Valid: ${validation.isValid ? '✅' : '❌'}
      `;
      
      setTestMessage(message);
    } catch (error) {
      setTestMessage(`❌ Validation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test backup
  const testBackup = async () => {
    try {
      setIsLoading(true);
      setTestMessage('Creating Firebase backup...');
      
      const backup = await createBackup();
      
      const message = `
📦 Backup Created Successfully!
- Timestamp: ${backup.timestamp}
- Shows: ${backup.shows.length}
- Reservations: ${backup.reservations.length}
- Config: ${backup.config ? '✅' : '❌'}
      `;
      
      setTestMessage(message);
    } catch (error) {
      setTestMessage(`❌ Backup failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔥 Firebase Integration Test</h2>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '20px',
        backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
        border: `1px solid ${isOnline ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <strong>Status:</strong> {status} {isOnline ? '🟢' : '🔴'}
        {error && <div style={{ color: '#721c24' }}>Error: {error}</div>}
      </div>

      {/* Data Summary */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Current Data:</h3>
        <ul>
          <li>Shows: {firebaseData.shows.shows.length} {firebaseData.shows.loading && '(loading...)'}</li>
          <li>Reservations: {firebaseData.reservations.reservations.length} {firebaseData.reservations.loading && '(loading...)'}</li>
          <li>Configuration: {firebaseData.config.config ? '✅ Loaded' : '❌ Not found'} {firebaseData.config.loading && '(loading...)'}</li>
        </ul>
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testAddShow} 
          disabled={isLoading || !isOnline}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Add Show
        </button>
        
        <button 
          onClick={testMigration} 
          disabled={isLoading || !isOnline}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Migration
        </button>
        
        <button 
          onClick={testValidation} 
          disabled={isLoading || !isOnline}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Validation
        </button>
        
        <button 
          onClick={testBackup} 
          disabled={isLoading || !isOnline}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Backup
        </button>
      </div>

      {/* Test Results */}
      {testMessage && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace'
        }}>
          <strong>Test Result:</strong><br />
          {testMessage}
        </div>
      )}

      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#6c757d'
        }}>
          🔄 Loading...
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
