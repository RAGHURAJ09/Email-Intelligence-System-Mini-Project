import React, { createContext, useState, useContext } from 'react';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
    // States: 'default', 'positive', 'negative', 'neutral'
    const [bgState, setBgState] = useState('default');

    const getSentimentColors = () => {
        switch(bgState) {
            case 'positive':
                return {
                    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 50%, rgba(16, 185, 129, 0.15) 100%)",
                    glowColor: "rgba(16, 185, 129, 0.4)",
                    particleColor: "#10b981"
                };
            case 'negative':
                return {
                    gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 50%, rgba(239, 68, 68, 0.15) 100%)",
                    glowColor: "rgba(239, 68, 68, 0.4)",
                    particleColor: "#ef4444"
                };
            case 'neutral':
                return {
                    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(139, 92, 246, 0.12) 100%)",
                    glowColor: "rgba(99, 102, 241, 0.3)",
                    particleColor: "#6366f1"
                };
            default:
                return {
                    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.08) 100%)",
                    glowColor: "rgba(99, 102, 241, 0.15)",
                    particleColor: "#6366f1"
                };
        }
    };

    return (
        <BackgroundContext.Provider value={{ bgState, setBgState, getSentimentColors }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => useContext(BackgroundContext);
