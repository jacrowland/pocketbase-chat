
import PocketBase, { Admin, Record } from "pocketbase";
import { createContext, ReactNode } from "react";

interface AuthContextProps { 
    user: Record | Admin | null;
    signOut: () => void;
    pocketbase: PocketBase;
}

export const AuthContext = createContext<AuthContextProps>({});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const pocketbase= new PocketBase('http://127.0.0.1:8090');
    const user = pocketbase.authStore.model;

    const signOut = () => {
        try {
            pocketbase.authStore.clear();
            if (!user) {
                console.log('User has signed out!');
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
