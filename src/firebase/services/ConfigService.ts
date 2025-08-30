import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config';
import type { AppConfig } from '../../types/types';

export class ConfigService {
    private static readonly COLLECTION_NAME = 'config';
    private static readonly CONFIG_DOC_ID = 'app-config';

    static async getConfig(): Promise<AppConfig | null> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_DOC_ID);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data() as AppConfig;
            }
            
            return null;
        } catch (error) {
            console.error('Error getting config:', error);
            throw error;
        }
    }

    static async updateConfig(config: AppConfig): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_DOC_ID);
            await setDoc(docRef, config, { merge: true });
        } catch (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    }

    static async updateMerchandise(merchandise: AppConfig['merchandise']): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_DOC_ID);
            await setDoc(docRef, { merchandise }, { merge: true });
        } catch (error) {
            console.error('Error updating merchandise:', error);
            throw error;
        }
    }

    static async updatePrices(prices: AppConfig['prices']): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, this.CONFIG_DOC_ID);
            await setDoc(docRef, { prices }, { merge: true });
        } catch (error) {
            console.error('Error updating prices:', error);
            throw error;
        }
    }
}
