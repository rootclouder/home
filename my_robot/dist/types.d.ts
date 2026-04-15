import type { ReactNode } from 'react';
export type FloatingRobotPosition = {
    x: number;
    y: number;
};
export type FloatingRobotSkin = {
    id: string;
    name: string;
    bg: string;
    ring: string;
    eye1: string;
    eye2: string;
    glow: string;
};
export type FloatingRobotAction = {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void | Promise<void>;
};
export type FloatingRobotProps = {
    actions?: FloatingRobotAction[];
    skins?: FloatingRobotSkin[];
    enableSkins?: boolean;
    defaultSkinId?: string;
    storageKey?: string;
    onSkinChange?: (skinId: string) => void;
    enableEyeTracking?: boolean;
    eyeTrackingMaxOffset?: number;
    eyeTrackingSensitivity?: number;
    enableDrag?: boolean;
    defaultPosition?: FloatingRobotPosition;
    boundsPadding?: number;
};
//# sourceMappingURL=types.d.ts.map