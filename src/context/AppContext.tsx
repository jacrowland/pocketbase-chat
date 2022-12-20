import React, { useState } from "react";
import PocketBase from "pocketbase";

interface AppContextProps { 

}

export const AppContext = React.createContext<AppContextProps>({});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppContext.Provider value={{ }}>
            {children}
        </AppContext.Provider>
    );
}
