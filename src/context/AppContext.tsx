import React, { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import usePocketbase from "../hooks/usePocketbase";
import useAuthContext from "../hooks/useAuthContext";

interface AppContextProps { 
    currentServer: string; // id of the server
    currentChannel: string; // id of the channel
    updateLocation: (serverId: string, channelId?: string) => void;
}

export const AppContext = React.createContext<AppContextProps>({});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentServer, setCurrentServer] = useState<string>('');
    const [currentChannel, setCurrentChannel] = useState<string>('');
    const { user } = useAuthContext();

    const pb = usePocketbase();

    // On load, get the first server the user is a member of and set it as the current server
    // then get the first channel in that server and set it as the current channel
    const initialize = async () => {
        const resultList = await pb.collection('memberships').getFirstListItem(`user = "${user.id}"`);
        await setDefaultChannel( resultList.server );
    };

    const setDefaultChannel = async ( serverId : string) => {
        const resultList = await pb.collection('channels').getFirstListItem(`server = "${serverId}"`);
        setCurrentChannel(resultList.id);
    };

    function updateLocation(serverId: string, channelId?: string) {
        setCurrentServer(serverId);
        if (channelId)
            setCurrentChannel(channelId);
        else {
            setDefaultChannel(serverId);
        }
    }

    useEffect(() => {
        console.log('Server changed', currentServer);
    }, [currentServer])

    useEffect(() => {
        console.log('Channel changed', currentServer);
    }, [currentChannel])

    useEffect(() => {
        initialize();
    }, [])

    return (
        <AppContext.Provider value={{currentServer, currentChannel, updateLocation }}>
            {children}
        </AppContext.Provider>
    );
}
