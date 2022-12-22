
import PocketBase, { Admin, Record } from "pocketbase";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { User } from "../types/records";



export const pocketbase = new PocketBase('http://127.0.0.1:8090');

interface AuthContextProps { 
    user: User | null;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextProps>({user : null, signOut: () => {}});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user , setUser] = useState<User | null>(pocketbase.authStore.model as User);
    const location = useLocation();
    const navigate = useNavigate();

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
        <AuthContext.Provider value={{ user, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
