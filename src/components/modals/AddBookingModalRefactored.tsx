// Refactored Add Booking Modal
// Example of how to integrate new UI components, stores, and i18n

import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button, Input, CustomSelect } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useReservationStore } from '../../stores';
import type { Reservation } from '../../types/types';

interface AddBookingModalRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  showDate?: string;
}

export const AddBookingModalRefactored: React.FC<AddBookingModalRefactoredProps> = ({
  isOpen,
  onClose,
  showDate
}) => {
  const { t } = useI18n();
  const { addReservation, isLoading } = useReservationStore();
  
  // Form state
  const [formData, setFormData] = useState({
    contactName: '',
    email: '',
    phone: '',
    guests: 2,
    date: showDate || '',
    drinkPackage: 'standard' as const
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = t('forms.validation.required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('forms.validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('forms.validation.email');
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('forms.validation.required');
    }
    
    if (formData.guests < 1) {
      newErrors.guests = t('forms.validation.min', { min: 1 });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const reservationData: Omit<Reservation, 'id'> = {
        ...formData,
        // Map form data to Reservation interface
        salutation: 'Dhr./Mevr.',
        address: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        addons: {},
        newsletter: false,
        termsAccepted: true,
        totalPrice: 0,
        checkedIn: false,
        status: 'confirmed',
        bookingSource: 'internal',
        createdAt: new Date().toISOString()
      };
      
      await addReservation(reservationData);
      onClose();
      
      // Reset form
      setFormData({
        contactName: '',
        email: '',
        phone: '',
        guests: 2,
        date: showDate || '',
        drinkPackage: 'standard'
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const drinkPackageOptions = [
    { value: 'standard', label: t('drinks.standard') },
    { value: 'premium', label: t('drinks.premium') }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('reservations.newReservation')}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('customers.contactName')}
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              error={errors.contactName}
              required
              placeholder="Voor- en achternaam"
            />
            
            <Input
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
              placeholder="naam@email.com"
            />
            
            <Input
              label={t('common.phone')}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              required
              placeholder="+31 6 12345678"
            />
            
            <Input
              label={t('reservations.guestCount')}
              type="number"
              min="1"
              max="20"
              value={formData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value) || 1)}
              error={errors.guests}
              required
            />
            
            <Input
              label={t('common.date')}
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={errors.date}
              required
            />
            
            <CustomSelect
              label="Drankenpakket"
              value={formData.drinkPackage}
              onValueChange={(value) => handleInputChange('drinkPackage', value)}
              options={drinkPackageOptions}
              placeholder="Selecteer pakket"
            />
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
