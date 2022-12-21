import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import useAuthContext from "../hooks/useAuthContext";
import TagIcon from "@mui/icons-material/Tag";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import ListItemText from "@mui/material/ListItemText";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import { Record } from "pocketbase";
import AddIcon from "@mui/icons-material/Add";
import AddChannelDialog from "./dialogs/AddChannelDialog";
import { UserButton } from "./UserButton";
import SectionHeader from "./SectionHeader";
import ProfileDialog from "./dialogs/ProfileDialog";

export default function ChannelNavigation() {
  const { signOut } = useAuthContext();
  const { currentServer, currentChannel, updateLocation } = useAppContext();
  const pb = usePocketbase();
  const [openAddChannelDialog, setOpenAddChannelDialog] = useState(false);
  const [channels, setChannels] = useState<Record[]>([]);
  let unsubscribe: () => void;

  useEffect(() => {
    const getChannels = async () => {
      const channels = await pb.collection("channels").getFullList(undefined, {
        filter: `server = "${currentServer?.id}"`,
      });
      setChannels(channels);
      unsubscribe = await pb
        .collection("channels")
        .subscribe("*", async ({ action, record }) => {
          if (action === "create") {
            setChannels((prevState) => [...prevState, record]);
          } else if (action === "delete") {
            setChannels((prevState) =>
              prevState.filter((m) => m.id !== record.id)
            );
          }
        });
    };

    if (currentServer) getChannels();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentServer, currentChannel]);

  const handleClick = (channelId: string) => {
    if (currentServer) updateLocation(currentServer?.id, channelId);
  };

  return (
    <>
      <Box
        width={250}
        display="flex"
        flexDirection="column"
        sx={{ backgroundColor: grey[200] }}
        overflow="auto"
        justifyContent="space-between"
      >
        <Box>
          <SectionHeader title={currentServer?.name} color="black" />
          <Accordion
            sx={{ backgroundColor: "transparent" }}
            defaultExpanded
            disableGutters
          >
            <Stack
              direction="row"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <AccordionSummary>
                <Typography variant="overline">Channels</Typography>
              </AccordionSummary>
              <Tooltip title="Add Channel">
                <IconButton
                  sx={{ mr: 1 }}
                  onClick={() => setOpenAddChannelDialog(true)}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <AccordionDetails sx={{ p: 0, pb: 2, m: 0 }}>
              <List sx={{ p: 0, m: 0 }}>
                {channels.map((channel) => (
                  <ListItem sx={{ p: 0, m: 0 }} key={channel.id}>
                    <ListItemButton onClick={() => handleClick(channel.id)}>
                      <TagIcon />
                      <ListItemText primary={channel.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>
        <UserControls />
      </Box>
      <AddChannelDialog
        open={openAddChannelDialog}
        onClose={() => setOpenAddChannelDialog(false)}
      />
    </>
  );

  function UserControls() {
    const { user } = useAuthContext();

    return (
        <Stack direction="row" justifyContent="space-between" p={1}>
          {user !== null && <UserButton onClick={() => setOpen(true)} user={user} />}
          <Tooltip title="Sign out">
            <IconButton sx={{ mr: 1 }} onClick={() => signOut()}>
              <MeetingRoomIcon />
            </IconButton>
          </Tooltip>
        </Stack>

    );
  }
}
