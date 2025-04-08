"use client";

import { useState } from 'react';

/**
 * Sistema de abas para alternar entre conteúdos
 */
export function Tabs({
    tabs,
    defaultTab,
    onChange,
    variant = "default",
}: {
    tabs: {
        id: string;
        label: string;
        icon?: React.ReactNode;
        content: React.ReactNode;
    }[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
    variant?: "default" | "pills" | "underline" | "bordered";
}) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (onChange) onChange(tabId);
    };

    // Estilos para variantes de tabs
    const tabStyles = {
        default: {
            container: "border-b border-gray-200",
            tab: "px-4 py-2 text-sm font-medium",
            active: "border-b-2 border-primary text-primary",
            inactive: "text-gray-500 hover:text-gray-700 hover:border-gray-300",
        },
        pills: {
            container: "flex space-x-2",
            tab: "px-4 py-2 text-sm font-medium rounded-full",
            active: "bg-primary text-white",
            inactive: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        },
        underline: {
            container: "",
            tab: "px-4 py-2 text-sm font-medium border-b-2",
            active: "border-primary text-primary",
            inactive: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        },
        bordered: {
            container: "border border-gray-200 rounded-lg p-1 bg-gray-50",
            tab: "px-4 py-2 text-sm font-medium rounded-md",
            active: "bg-white shadow-sm text-primary",
            inactive: "text-gray-500 hover:text-gray-700",
        },
    };

    const styles = tabStyles[variant];

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div>
            <div className={`flex ${styles.container}`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : styles.inactive} flex items-center`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-4">
                {activeTabContent}
            </div>
        </div>
    );
}