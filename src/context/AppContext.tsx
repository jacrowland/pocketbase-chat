import React, { useEffect, useState } from "react";
import PocketBase, { Record } from "pocketbase";
import usePocketbase from "../hooks/usePocketbase";
import useAuthContext from "../hooks/useAuthContext";
import { Channel, Membership, Server } from "../types/records";

interface AppContextProps {
  currentServer: Server | null; // id of the server
  currentChannel: Channel | null; // id of the channel
  memberships: Membership[]; // list of memberships
  updateLocation: (serverId: string, channelId?: string) => void;
}

export const AppContext = React.createContext<AppContextProps>({
  currentServer: null,
  currentChannel: null,
  memberships: [],
  updateLocation: () => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pb = usePocketbase();
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const { user } = useAuthContext();

  const updateLocation = async (serverId: string, channelId?: string) => {
    const server = await getServerById(serverId);
    let channel: Channel;

    // if no channel is specified, get the default channel
    if (!channelId) {
      channel = await getDefaultChannel(serverId);
    } else {
      channel = await getChannelById(channelId);
    }

    setCurrentServer(server);
    setCurrentChannel(channel);
  };

  const getDefaultChannel = async (serverId: string): Promise<Channel> => {
    return await pb
      .collection("channels")
      .getFirstListItem(`server = "${serverId}"`) as Channel;
  };

  const getServerById = async (serverId: string): Promise<Server> => {
    return await pb.collection("servers").getOne(serverId) as Server;
  };

  const getChannelById = async (channelId: string): Promise<Channel> => {
    return await pb.collection("channels").getOne(channelId) as Channel;
  };

  const getMemberships = async (): Promise<Membership[]> => {
    const userId = user?.id;
    return await pb.collection("memberships").getFullList(undefined, {
      filter: `user = "${userId}"`,
      expand: "server",
    }) as Membership[];
  };

  useEffect(() => {
    // Initialise the application context
    if (user) {
      getMemberships().then((memberships) => {
        setMemberships(memberships);
        updateLocation(memberships[0].server);
      });
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{ currentServer, currentChannel, updateLocation, memberships }}
    >
      {children}
    </AppContext.Provider>
  );
};
