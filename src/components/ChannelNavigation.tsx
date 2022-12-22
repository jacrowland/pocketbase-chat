import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import useAuthContext from "../hooks/useAuthContext";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import ListItemText from "@mui/material/ListItemText";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import AddIcon from "@mui/icons-material/Add";
import AddChannelDialog from "./dialogs/AddChannelDialog";
import { UserButton } from "./button/UserButton";
import SectionHeader from "./SectionHeader";
import SignOutButton from "./button/SignOutButton";
import { Channel } from "../types/records";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ChannelNavigation() {
  const { currentServer } = useAppContext();
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      width={250}
      display="flex"
      flexDirection="column"
      sx={{ backgroundColor: grey[300] }}
      overflow="auto"
      justifyContent="space-between"
    >
      <Box>
        <SectionHeader
          title={currentServer ? currentServer.name : "Server"}
          color="black"
        />
        <Accordion
          onChange={() => setExpanded(!expanded)}
          defaultExpanded
          sx={{ backgroundColor: "transparent" }}
          disableGutters
        >
          <Stack
            direction="row"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack alignItems="center" direction="row">
            <ArrowDropDownIcon sx={{ mt: -0.5, ml: 1, transition: '0.3s ease-in-out', transform: expanded ? ''  : 'rotate(-90deg)' }} />
              <AccordionSummary>
                <Typography variant="overline">Channels</Typography>
              </AccordionSummary>
            </Stack>
            <AddChannelButton />
          </Stack>
          <AccordionDetails sx={{ p: 0, pb: 1, m: 0 }}>
            <ChannelList />
          </AccordionDetails>
        </Accordion>
      </Box>
      <UserControls />
    </Box>
  );
}

function UserControls() {
  const { user } = useAuthContext();
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      p={1}
      alignItems="center"
    >
      {user !== null && <UserButton user={user} />}
      <SignOutButton />
    </Stack>
  );
}

function ChannelList(): JSX.Element {
  const { currentServer, updateLocation } = useAppContext();

  const handleClick = (channelId: string) => {
    if (currentServer) updateLocation(currentServer?.id, channelId);
  };

  const { currentChannel } = useAppContext();
  const pb = usePocketbase();
  let unsubscribe: () => void;

  const [channels, setChannels] = useState<Channel[]>([]);

  // Listen for changes to the channels collection
  useEffect(() => {
    const getChannels = async () => {
      const channels = await pb
        .collection("channels")
        .getFullList(undefined, {
          filter: `server = "${currentServer?.id}"`,
        });
      setChannels(channels as Channel[]);
      unsubscribe = await pb
        .collection("channels")
        .subscribe("*", async ({ action, record }) => {
          if (action === "create") {
            setChannels((prevState) => [...prevState, record] as Channel[]);
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

  return (
    <List sx={{ p: 0, m: 0 }}>
      {channels.map((channel) => (
        <ChannelListItem
          key={channel.id}
          channel={channel}
          onClick={() => handleClick(channel.id)}
        />
      ))}
    </List>
  );
}

interface ChannelListItemProps {
  channel: Channel;
  onClick: () => void;
}

function ChannelListItem({
  channel,
  onClick,
}: ChannelListItemProps): JSX.Element {
  const [hover, setHover] = useState(false)

  return (
    <ListItem sx={{ p: 0, m: 0 }} key={channel.id}>
      <ListItemButton onClick={() => onClick()} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>  
        <ListItemText>
          <Stack direction='row' alignContent='center' justifyContent='space-between'>
            <Stack direction='row' spacing={1}>
              <Typography variant='body1' fontWeight='bold'>#</Typography>
              <Typography variant="body2">{channel.name}</Typography>
            </Stack>
            {
              hover && 
            <DeleteChannelButton channel={channel}/>
            }
          </Stack>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

interface AddChannelDialogProps {
  open: boolean;
  onClose: () => void;
  channelName: string;
  channelId: string;
}


function DeleteChannelDialog({ open, onClose, channelName, channelId } : AddChannelDialogProps) : JSX.Element {
  const pb = usePocketbase();

  const handleDelete = async () => {
    try {
      await pb.collection("channels").delete(channelId);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Delete Channel</DialogTitle>
      <DialogContent>
        <DialogContentText>

          Are you sure you want to delete <strong>{channelName}</strong>? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => handleDelete()}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteChannelButton({ channel }: { channel: Channel }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Delete Channel">
        <IconButton size="small" sx={{ p: 0, opacity: 0.9 }} onClick={() => setOpen(true)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <DeleteChannelDialog open={open} onClose={() => setOpen(false)} channelId={channel.id} channelName={channel.name} />
    </>
  );
}


function AddChannelButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Box>
        <Tooltip title="Add Channel">
          <IconButton  sx={{ mr: 1 }} onClick={() => setOpen(true)}>
            <AddIcon fontSize='small'/>
          </IconButton>
        </Tooltip>
      </Box>
      <AddChannelDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
