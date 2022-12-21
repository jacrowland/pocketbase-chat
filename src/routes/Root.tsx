import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import useAuthContext from "../hooks/useAuthContext";
import TagIcon from "@mui/icons-material/Tag";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import ListItemText from "@mui/material/ListItemText";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import { Record } from "pocketbase";
import AddIcon from "@mui/icons-material/Add";
import AddChannelDialog from "../components/AddChannelDialog";

export default function Root() {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return (
      <Stack
        bgcolor={grey[900]}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100vw"
      >
        <CircularProgress size={75} />
      </Stack>
    )
  }

  return (
    <Stack
      height="100vh"
      maxHeight="100vh"
      width="100vw"
      direction="row"
      display="flex"
    >
      <ServerNavigation />
      <ChannelNavigation />
      <ChannelContent />
      <MembersList />
    </Stack>
  );
}

function SectionHeader({
  title,
  color = "white",
}: {
  title: string;
  color?: "white" | "black";
}): JSX.Element {
  return (
    <Box py={2} width="100%" bgcolor={grey[200]}>
      <SectionTitle title={title} color={color} />
    </Box>
  );
}

function SectionTitle({
  title,
  color = "white",
}: {
  title: string;
  color?: "white" | "black";
}): JSX.Element {
  return (
    <Typography p={2} fontWeight="bold" variant="overline" color={color}>
      {title}
    </Typography>
  );
}

function ServerNavigation() {
  const { currentServer, memberships } = useAppContext();

  // Display the current servers that the user is a member of
  return (
    <Box width={100} sx={{ backgroundColor: grey[900] }} overflow="auto">
      <Stack
        direction="column"
        spacing={1}
        mt={3}
        justifyItems="center"
        alignItems="center"
      >
        {memberships.map((membership) => (
          <ServerButton
            key={membership.id}
            name={membership.expand.server.name}
            id={membership.server}
          />
        ))}
      </Stack>
    </Box>
  );
}

function ServerButton({ name, id }: { name: string; id: string }): JSX.Element {
  const { updateLocation } = useAppContext();

  const handleClick = () => {
    updateLocation(id);
  };

  return (
    <Box>
      <Tooltip title={name} placement="right">
        <IconButton onClick={() => handleClick()}>
          <Avatar>{name[0].toLocaleUpperCase()}</Avatar>
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function ChannelNavigation() {
  const { user, signOut } = useAuthContext();
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
            <Tooltip title='Add Channel'>
              <IconButton sx={{mr: 1}} onClick={() => setOpenAddChannelDialog(true)}>
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
      <Box pl={2} pb={2}>
        <Stack direction='row' justifyContent='space-between'>
          <User user={user} />
          <Tooltip title='Sign out'>
            <IconButton sx={{mr: 1}} onClick={() => signOut()}>
                  <MeetingRoomIcon/>
            </IconButton>
          </Tooltip>

        </Stack>

      </Box>
    </Box>
    <AddChannelDialog open={openAddChannelDialog} onClose={() => setOpenAddChannelDialog(false)}/>
    </>

  );
}

function User({ user }: { user: Record }): JSX.Element {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Avatar> J </Avatar>
      <Typography>{user?.username}</Typography>
    </Stack>
  );
}

function SendMessageInput() {
  const pb = usePocketbase();
  const [text, setText] = useState("");
  const { user } = useAuthContext();
  const { currentChannel } = useAppContext();

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (user) {
        const data = {
          text: text,
          user: user.id,
          channel: currentChannel?.id,
        };
        console.log(data);

        const createdMessage = await pb.collection("messages").create(data);
        setText("");
      } else {
        throw new Error("User not logged in");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={(e) => sendMessage(e)}>
      <Stack direction="row" spacing={1} p={1}>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          id="outlined-basic"
          label={`Message #${currentChannel?.name}`}
          variant="outlined"
        />
        <Box display='flex' justifyContent='center' alignItems='center'>
          <Tooltip title='Send'>
            <IconButton type='submit'>
              <PlayArrowIcon/>
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
    </form>
  );
}

function ChannelContent() {
  const { currentChannel } = useAppContext();
  return (
    <Box height="100vh" flexGrow={1} sx={{ backgroundColor: grey[100] }}>
      <Stack direction="column" height="100%" justifyContent="space-between">
        <SectionHeader title={`# ${currentChannel?.name}`} color="black" />
        <Messages />
        <SendMessageInput />
      </Stack>
    </Box>
  );
}

function Messages(): JSX.Element {
  const pb = usePocketbase();

  const { currentServer, currentChannel } = useAppContext();
  let unsubscribe: () => void;

  useEffect(() => {
    const getMessages = async () => {
      const result = await pb.collection("messages").getFullList(undefined, {
        sort: "created",
        expand: "user",
        filter: `channel = "${currentChannel?.id}"`,
      });

      console.log(result);
      setMessages(result);

      unsubscribe = await pb
        .collection("messages")
        .subscribe("*", async ({ action, record }) => {
          const user = await pb.collection("users").getOne(record.user);
          record.expand = { user };
          if (action === "create") {
            setMessages((prevState) => [...prevState, record]);
          } else if (action === "delete") {
            setMessages((prevState) =>
              prevState.filter((m) => m.id !== record.id)
            );
          }
        });
    };

    getMessages();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentServer, currentChannel]);

  const [messages, setMessages] = useState<Record[]>([]);

  return (
    <Stack direction="column" spacing={1} p={1} overflow="auto" flexGrow={1}>
      {messages.length > 0 ? (
        messages.map((message) => (
          <Message
            key={message.id}
            text={message.text}
            username={message.expand.user.username}
            timestamp={new Date(message.created)}
          />
        ))
      ) : (
        <Box width="100%" justifyContent="center" alignItems="center">
          <Alert severity="info">
            This is the start of #{currentChannel?.name}. Send a message!
          </Alert>
        </Box>
      )}
    </Stack>
  );
}

function Message({
  text,
  username,
  timestamp,
}: {
  text: string;
  username: string;
  timestamp: Date;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box bgcolor={hover ? grey[200] : ""} borderRadius={2} p={1}>
        <Stack direction="row" spacing={2}>
          <Box mt={1}>
            <Avatar>{username[0].toUpperCase()}</Avatar>
          </Box>
          <Stack direction="column">
            <Stack direction="row" spacing={1}>
              <Typography variant="overline">{username}</Typography>
              <Typography variant="overline">
                {timestamp.toLocaleDateString()} - {timestamp.getHours()}:
                {timestamp.getMinutes()}:{timestamp.getSeconds()}
              </Typography>
            </Stack>
            <Typography variant="body1">{text}</Typography>
          </Stack>
        </Stack>
      </Box>
    </div>
  );
}

function MembersList(): JSX.Element {
  const pb = usePocketbase();
  const { currentServer } = useAppContext();
  const [members, setMembers] = useState<Record[]>([]);

  useEffect(() => {
    const getMembers = async () => {
      const members = await pb
        .collection("memberships")
        .getFullList(undefined, {
          filter: `server = "${currentServer?.id}"`,
          expand: "user",
        });
      console.log(members);
      setMembers(members);
    };
    getMembers();
  }, [currentServer]);

  return (
    <Box width={275} bgcolor={grey[300]}>
      <SectionHeader title={`Members (${members.length})`} color="black" />
      <Stack direction="column" spacing={1} p={1}>
        {members.length > 0 &&
          members.map((member) => (
            <ListItemButton key={member.id}>
              <User key={member.id} user={member.expand.user} />
            </ListItemButton>
          ))}
      </Stack>
    </Box>
  );
}
