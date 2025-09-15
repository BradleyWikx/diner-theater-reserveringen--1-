// src/components/booking/wizard/ReservationWizard.tsx
import React, { useState } from 'react';
import type { ShowEvent, Reservation, AppConfig } from '../../../types/types';
import { Icon } from '../../UI/Icon';

// --- Reusable Wizard Components ---

const WizardStepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = ['Pakket', 'Extra\'s', 'Gegevens', 'Overzicht'];
    return (
        <div className="wizard-v2-steps">
            {steps.map((step, index) => (
                <div key={step} className={`wizard-step ${index + 1 === currentStep ? 'active' : ''}`}>
                    <div className="wizard-step-number">{index + 1}</div>
                    <span>{step}</span>
                </div>
            ))}
        </div>
    );
};

const QuantityStepper = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => onChange(Math.max(0, value - 1))}>-</button>
        <span>{value}</span>
        <button onClick={() => onChange(value + 1)}>+</button>
    </div>
);


// --- Wizard Steps ---

const PackageSelectionStep = ({ onNext }: { onNext: (data: any) => void }) => {
    const [selectedPackage, setSelectedPackage] = useState('Standaard');
    return (
        <div>
            <h2 className="wizard-step-title">1. Kies uw Pakket</h2>
            <div className="package-selection-grid">
                <div className={`package-card ${selectedPackage === 'Standaard' ? 'selected' : ''}`} onClick={() => setSelectedPackage('Standaard')}>
                    <h3 className="package-title">Standaard</h3>
                    <ul className="package-benefits">
                        <li>✓ Toegang tot de show</li>
                        <li>✓ Welkomstdrankje</li>
                    </ul>
                </div>
                <div className={`package-card ${selectedPackage === 'Premium' ? 'selected' : ''}`} onClick={() => setSelectedPackage('Premium')}>
                    <h3 className="package-title">Premium</h3>
                    <ul className="package-benefits">
                        <li>✓ Toegang tot de show</li>
                        <li>✓ Beste plaatsen</li>
                        <li>✓ Onbeperkt drankjes</li>
                        <li>✓ Verrassing van de chef</li>
                    </ul>
                </div>
            </div>
            <button onClick={() => onNext({ package: selectedPackage })} className="summary-cta-button">Volgende</button>
        </div>
    );
}

const ExtrasStep = ({ onNext, onBack }: { onNext: (data: any) => void, onBack: () => void }) => {
    const [drinks, setDrinks] = useState(0);
    const [merch, setMerch] = useState(0);
    return (
        <div>
            <h2 className="wizard-step-title">2. Kies uw Extra's</h2>
            <div className="extras-grid">
                <div className="extra-item">
                    <div className="extra-image"></div>
                    <span>Extra Drankjes</span>
                    <QuantityStepper value={drinks} onChange={setDrinks} />
                </div>
                <div className="extra-item">
                    <div className="extra-image"></div>
                    <span>Merchandise</span>
                    <QuantityStepper value={merch} onChange={setMerch} />
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
                <button onClick={onBack} className="secondary-action-button">Terug</button>
                <button onClick={() => onNext({ extras: { drinks, merch } })} className="summary-cta-button" style={{width: 'auto'}}>Volgende</button>
            </div>
        </div>
    );
}

const DetailsStep = ({ onNext, onBack }: { onNext: (data: any) => void, onBack: () => void }) => (
    <div>
        <h2 className="wizard-step-title">3. Uw Gegevens</h2>
        <div className="form-grid">
            <input placeholder="Naam" />
            <input placeholder="Email" />
            <input placeholder="Telefoon" />
            <input placeholder="Aantal personen" type="number" />
        </div>
         <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
            <button onClick={onBack} className="secondary-action-button">Terug</button>
            <button onClick={() => onNext({})} className="summary-cta-button" style={{width: 'auto'}}>Naar Overzicht</button>
        </div>
    </div>
);

const OverviewStep = ({ onBack, onSubmit, data }: { onBack: () => void, onSubmit: () => void, data: any }) => (
    <div>
        <h2 className="wizard-step-title">4. Overzicht van uw boeking</h2>
        <p>Pakket: {data.package}</p>
        <p>Extra drankjes: {data.extras?.drinks}</p>
        <p>Merchandise: {data.extras?.merch}</p>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
            <button onClick={onBack} className="secondary-action-button">Terug</button>
            <button onClick={onSubmit} className="summary-cta-button" style={{width: 'auto'}}>Bevestig Reservering</button>
        </div>
    </div>
);


interface ReservationWizardProps {
  show: ShowEvent;
  date: string;
  onAddReservation: (res: Omit<Reservation, 'id'>) => void;
  config: AppConfig;
  remainingCapacity: number;
  onClose: () => void;
}

export const ReservationWizard: React.FC<ReservationWizardProps> = ({ show, date, onAddReservation, config, remainingCapacity, onClose }) => {
  const [step, setStep] = useState(1);
  const [reservationData, setReservationData] = useState<any>({});

  const handleNext = (data: any) => {
    setReservationData(prev => ({ ...prev, ...data }));
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = () => {
      console.log("Submitting reservation:", reservationData);
      // Hier zou de logica komen om het `reservation` object samen te stellen
      // en `onAddReservation` aan te roepen.
      onClose(); // Sluit de wizard na bevestiging
  }

  return (
    <div className="reservation-wizard-v2">
        <button onClick={onClose} className="wizard-close-btn"><Icon id="x" /></button>
        <WizardStepIndicator currentStep={step} />
        <div className="wizard-content">
            {step === 1 && <PackageSelectionStep onNext={handleNext} />}
            {step === 2 && <ExtrasStep onNext={handleNext} onBack={handleBack} />}
            {step === 3 && <DetailsStep onNext={handleNext} onBack={handleBack} />}
            {step === 4 && <OverviewStep onBack={handleBack} onSubmit={handleSubmit} data={reservationData} />}
        </div>
    </div>
  );
};
