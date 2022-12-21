import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import useAuthContext from "../hooks/useAuthContext";
import TagIcon from "@mui/icons-material/Tag";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import { Record } from "pocketbase";

export default function Root() {
  return (
    <Stack width="100vw" direction="row" display="flex">
      <ServerSelect />
      <ChannelSelect />
      <Messages />
      <Members />
    </Stack>
  );
}

function ServerSelect() {
  const pb = usePocketbase();
  const { user } = useAuthContext();

  let [memberships, setMemberships] = useState<Record[]>([]);

  const getMemberships = async () => {
    const resultList = await pb
      .collection("memberships")
      .getFullList(undefined, {
        filter: `user = "${user?.id}"`,
        expand: "server",
      });
    setMemberships(resultList);
  };

  useEffect(() => {
    getMemberships();
  }, []);

  return (
    <Box height="100vh" width={125} sx={{ backgroundColor: grey[900] }}>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        pt={1}
      >
        {memberships.map((membership) => {
          return (
            <ServerButton
              key={membership.id}
              id={membership.server}
              name={membership.expand.server.name}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

function ServerButton({ name, id }: { name: string; id: string }) {
  const { updateLocation } = useAppContext();
  const handleClick = () => {
    updateLocation(id, undefined);
  };
  return (
    <Tooltip title={name} placement="right">
      <IconButton onClick={() => handleClick()}>
        <Avatar sx={{ padding: 0, margin: 0, height: 75, width: 75 }}>
          {name[0]}
        </Avatar>
      </IconButton>
    </Tooltip>
  );
}

function ChannelSelect() {
  const { user } = useAuthContext();
  const pb = usePocketbase();
  const { currentServer } = useAppContext();

  const [currentServerName, setCurrentServerName] = useState<string>("");

  let [channels, setChannels] = useState<Record[]>([]);

  useEffect(() => {
    const getChannels = async () => {
      const resultList = await pb
        ?.collection("channels")
        .getFullList(undefined, {
          expand: "server",
          filter: `server = "${currentServer}"`,
        });
      console.log(resultList);
      setChannels(resultList);
    };

    const getServerName = async () => {
      const server = await pb
        ?.collection("servers")
        .getFirstListItem(currentServer);
      setCurrentServerName(server.name);
    };

    getChannels();
    getServerName();
  }, [currentServer]);

  return (
    <Box
      height="100vh"
      bgcolor={grey[200]}
      flexDirection="column"
      width={250}
      display="flex"
      justifyContent="space-between"
    >
      <Box>
        <Box width="100%" p={2}>
          <Typography fontWeight="bold" variant="overline">
            {currentServerName}
          </Typography>
        </Box>
        <List>
          {channels.map((channel) => (
            <ListItem key={channel.id}>
              <ChannelButton id={channel.id} name={channel.name} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box p={1}>
        <Typography variant="overline" align="center">
          {user?.email}
        </Typography>
      </Box>
    </Box>
  );
}

function ChannelButton({ name, id }: { name: string; id: string }) {
  const { updateLocation, currentServer } = useAppContext();

  const handleClick = () => {
    updateLocation(currentServer, id);
  };

  return (
    <ListItemButton onClick={() => handleClick()}>
      <TagIcon fontSize="small" />
      <Typography variant="button">{name}</Typography>
    </ListItemButton>
  );
}

function Messages() {
  const [text, setText] = useState<string>("");
  const { user } = useAuthContext();
  const pb = usePocketbase();
  const [messages, setMessages] = useState<any[]>([]);

  const { currentServer, currentChannel } = useAppContext();
  const [currentChannelName, setCurrentChannelName] = useState<string>("");

  let unsubscribe: () => void;

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (user) {
        const data = {
          text: text,
          user: user.id,
          channel: currentChannel,
        };
        const createdMessage = await pb.collection("messages").create(data);
        setText("");
      } else {
        throw new Error("User not logged in");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const getMessages = async () => {
      const result = await pb.collection("messages").getList(1, 10, {
        sort: "created",
        expand: "user",
        filter: `channel = "${currentChannel}"`,
      });

      setMessages(result.items);

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

    const getChannelName = async () => {
      const channel = await pb.collection("channels").getOne(currentChannel);
      setCurrentChannelName(channel.name);
    };

    getMessages();
    getChannelName();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentServer, currentChannel]);

  return (
    <Box height="100vh" flexGrow={1} sx={{ backgroundColor: grey[100] }}>
      <Stack direction="column" height="100%" justifyContent="space-between">
        <Box width="100%" p={2} bgcolor={grey[100]}>
            <Typography variant="overline">{currentChannelName}</Typography>
        </Box>
        <Stack direction="column" spacing={1} p={1} overflow="auto" flexGrow={1}>
          {messages &&
            messages.map((message) => (
              <Message
                key={message.id}
                text={message.text}
                username={message.expand.user.username}
                timestamp={message.created}
              />
            ))}
        </Stack>
        <form onSubmit={(e) => sendMessage(e)}>
          <Stack direction="row" spacing={1} p={1}>
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              id="outlined-basic"
              label="Message #announcements "
              variant="outlined"
            />
            <Button type="submit" variant="outlined">
              Send
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}

function Message({
  text,
  username,
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
            <Avatar>{username[0]}</Avatar>
          </Box>
          <Stack direction="column">
            <Stack direction="row" spacing={1}>
              <Typography variant="overline">{username}</Typography>
              <Typography variant="overline">1/1/1</Typography>
            </Stack>
            <Typography variant="body1">{text}</Typography>
          </Stack>
        </Stack>
      </Box>
    </div>
  );
}


function Members() {
    const pb = usePocketbase();
    const { currentServer } = useAppContext();
    const [members, setMembers] = useState<Record[]>([]);

    useEffect(() => {
        async function getMembers() {
            const records = await pb.collection('memberships').getFullList(200 /* batch size */, {
                sort: '-created',
                expand: 'user',
            });
            setMembers(records);
            console.log(records);
        }
        getMembers();
    }, [])

  return (
    <Box
      height="100vh"
      minWidth={300}
      borderRight="1px solid black"
      sx={{ backgroundColor: grey[800] }}
    >
        <Box width="100%" p={2}>
            <Typography color='white' variant="overline">Members</Typography>
        </Box>
      <List>
        {
            members.map((member) => (
                <Member key={member.id} username={member.expand.user.username} />
            ))
        }
      </List>
    </Box>
  );
}

function Member( { username }: { username: string }) {
    return (
        <ListItem>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar>{username[0].toUpperCase()}</Avatar>
            </ListItemAvatar>
            <ListItemText sx={{color: 'white'}}>{username}</ListItemText>
          </ListItemButton>
        </ListItem>
    )
}