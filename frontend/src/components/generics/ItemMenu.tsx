'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Button } from '@/components/generics/Button';
import { ThreeDotIcon } from '@/components/generics/Icons';
import Portal from '@/components/generics/Portal'; // Import Portal

interface MenuItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

interface ItemMenuProps {
    items: MenuItem[];
    icon?: React.ReactNode;
    position?: 'left' | 'right'; // Position relative to the trigger button
}

const ItemMenu: React.FC<ItemMenuProps> = ({ items, icon, position = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
    const [menuNode, setMenuNode] = useState<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleMenu = () => {
        setIsOpen(prev => !prev);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuNode && !menuNode.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuNode]);

    // Positioning logic for Portal
    useLayoutEffect(() => {
        if (isOpen && buttonRef.current && menuNode) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuRect = menuNode.getBoundingClientRect();
            const gap = 4; // A small gap

            let top = buttonRect.top;
            let left: number;

            // --- Horizontal Positioning ---
            if (position === 'right') {
                // Try to position on the right
                left = buttonRect.right + gap;
                // If it overflows, position on the left
                if (left + menuRect.width > window.innerWidth) {
                    left = buttonRect.left - menuRect.width - gap;
                }
            } else { // position === 'left'
                // Try to position on the left
                left = buttonRect.left - menuRect.width - gap;
                // If it overflows, position on the right
                if (left < 0) {
                    left = buttonRect.right + gap;
                }
            }

            // --- Vertical Positioning & Correction ---
            // If it overflows from the bottom, align menu bottom with button bottom.
            if (top + menuRect.height > window.innerHeight) {
                top = buttonRect.bottom - menuRect.height;
            }

            // Final check to ensure it's not off-screen.
            if (top < 0) {
                top = gap;
            }
            if (left < 0) {
                left = gap;
            }
            if (left + menuRect.width > window.innerWidth) {
                left = window.innerWidth - menuRect.width - gap;
            }


            setMenuStyles({
                position: 'absolute',
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 9999, // Ensure it's on top
            });
        }
    }, [isOpen, position, menuNode]);

    return (
        <div className="relative inline-block text-left">
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {icon || <ThreeDotIcon className="h-5 w-5 text-gray-400" />}
            </Button>

            {isOpen && (
                <Portal>
                    <div
                        ref={setMenuNode}
                        style={menuStyles}
                        className="w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="menu-button"
                    >
                        <div className="py-1" role="none">
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className="group flex items-center w-full px-4 py-2 rounded-md text-sm text-foreground hover:bg-secondary hover:text-primary"
                                    role="menuitem"
                                >
                                    {item.icon && <span className="mr-3">{item.icon}</span>}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default ItemMenu;