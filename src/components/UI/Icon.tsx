import React from 'react';

interface IconProps {
    id: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ id, className }) => (
    <svg className={`icon ${className || ''}`} aria-hidden="true" focusable="false">
        <use href={`#icon-${id}`}></use>
    </svg>
);
