import React, { createContext, useState, useContext } from 'react';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
    const [bgState, setBgState] = useState('default'); // 'default', 'high', 'low'

    return (
        <BackgroundContext.Provider value={{ bgState, setBgState }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => useContext(BackgroundContext);
