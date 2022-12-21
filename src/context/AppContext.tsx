import React, { useEffect, useState } from "react";
import PocketBase, { Record } from "pocketbase";
import usePocketbase from "../hooks/usePocketbase";
import useAuthContext from "../hooks/useAuthContext";

interface AppContextProps {
  currentServer: Record | null; // id of the server
  currentChannel: Record | null; // id of the channel
  memberships: Record[]; // list of memberships
  updateLocation: (serverId: string, channelId?: string) => void;
  isLoading: boolean;
}

export const AppContext = React.createContext<AppContextProps>({
  currentServer: null,
  currentChannel: null,
    memberships: [] as Record[],
  updateLocation: () => {},
  isLoading: true,
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pb = usePocketbase();
  const [currentServer, setCurrentServer] = useState<Record | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [memberships, setMemberships] = useState<Record[]>([]);
  const { user } = useAuthContext();

  const updateLocation = async (serverId: string, channelId?: string) => {
    const server = await getServerById(serverId);
    let channel: Record;

    // if no channel is specified, get the default channel
    if (!channelId) {
        channel = await getDefaultChannel(serverId);
    }
    else {
        channel = await getChannelById(channelId);
    }

    setCurrentServer(server);
    setCurrentChannel(channel);
  };

  const getDefaultChannel = async (serverId: string) => {
    return await pb
    .collection("channels")
    .getFirstListItem(`server = "${serverId}"`);
  };

  const getServerById = async (serverId: string): Promise<Record> => {
    return await pb.collection("servers").getOne(serverId);
  };

  const getChannelById = async (channelId: string): Promise<Record> => {
    return await pb.collection("channels").getOne(channelId);
  };

  const getMemberships = async (): Promise<Record[]> => {
    const userId = user?.id;
    return await pb.collection("memberships").getFullList(undefined, {
      filter: `user = "${userId}"`,
      expand: "server",
    });
  };

  useEffect(() => {
    // Initialise the application context
    if (user) {
        getMemberships().then((memberships) => {
            setMemberships(memberships);
            updateLocation(memberships[0].server);
            setIsLoading(false);
        });
    }
  }, [user])

  useEffect(() => {
    if (!currentServer || !currentChannel) return;
    console.log("Server:", currentServer.name);
    console.log("Channel:", currentChannel.name);
  }, [currentServer, currentChannel])

  return (
    <AppContext.Provider
      value={{ currentServer, currentChannel, updateLocation, memberships, isLoading }}
    >
      {children}
    </AppContext.Provider>
  );
};
