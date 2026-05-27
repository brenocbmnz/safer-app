import type { ReactNode } from 'react';
import { BottomNav } from '@/components/BottomNav';

type Props = {
    children: ReactNode;
};

export function SaferAppLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="flex-1 pb-16">{children}</div>
            <BottomNav />
        </div>
    );
}
