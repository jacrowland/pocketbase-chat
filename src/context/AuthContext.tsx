
import PocketBase, { Admin, Record } from "pocketbase";
import { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextProps { 
    user: Record | null;
    signOut: () => void;
    pocketbase: PocketBase;
}

export const AuthContext = createContext<AuthContextProps>({user : null, signOut: () => {}, pocketbase: new PocketBase('http://127.0.0.1:8090')});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const pocketbase = new PocketBase('http://127.0.0.1:8090');
    const [user , setUser] = useState<Record | null>(!(pocketbase.authStore.model instanceof Admin) ? pocketbase.authStore.model : null);
    
    const signOut = () => {
        try {
            pocketbase.authStore.clear();
            setUser(null);
            if (!user) {
                console.log('User has signed out!');
                window.location.reload();
            }
        }
        catch(e) {
            console.error(e);
        }
    }

    return (
        <AuthContext.Provider value={{ pocketbase, user, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
