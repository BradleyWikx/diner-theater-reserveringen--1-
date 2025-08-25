import React from 'react';
import { Icon } from '../UI/Icon';
import { i18n } from '../../config/config';

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, totalSteps }) => {
    const stepLabels = [
        i18n.wizardStep1, 
        i18n.wizardStep2, 
        i18n.wizardStep3, 
        i18n.wizardStep4, 
        i18n.wizardStep5
    ];
    
    return (
        <div className="wizard-progress">
            {stepLabels.slice(0, totalSteps).map((label, index) => {
                const step = index + 1;
                return (
                    <div 
                        key={step} 
                        className={`wizard-progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                    >
                        <div className="step-circle">
                            {currentStep > step ? <Icon id="check" /> : step}
                        </div>
                        <div className="step-label">{label}</div>
                    </div>
                );
            })}
        </div>
    );
};
