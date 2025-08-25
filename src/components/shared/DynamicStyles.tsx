import React from 'react';
import { generateShowTypeCSS } from '../../utils/utilities';
import type { AppConfig } from '../../types/types';

interface DynamicStylesProps {
    config: AppConfig;
}

export const DynamicStyles: React.FC<DynamicStylesProps> = ({ config }) => {
    const css = generateShowTypeCSS(config);
    
    return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
};
