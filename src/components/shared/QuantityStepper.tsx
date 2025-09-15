import React from 'react';
import { Icon } from '../UI/Icon';

interface QuantityStepperProps {
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({ 
    value, 
    onChange, 
    min = 0, 
    max = 99, 
    disabled = false 
}) => {
    const handleIncrement = () => !disabled && onChange(Math.min(max, value + 1));
    const handleDecrement = () => !disabled && onChange(Math.max(min, value - 1));

    return (
        <div className={`quantity-stepper ${disabled ? 'disabled' : ''}`}>
            <button type="button" onClick={handleDecrement} disabled={value <= min || disabled} aria-label="Minder">
                <Icon id="remove" />
            </button>
            <span className="quantity-value">{value}</span>
            <button type="button" onClick={handleIncrement} disabled={value >= max || disabled} aria-label="Meer">
                <Icon id="add" />
            </button>
        </div>
    );
};
