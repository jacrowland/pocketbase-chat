import {
  Alert,
  Avatar,
  Box, Link, Stack, Typography
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import { Record } from "pocketbase";
import { UserButton } from "./UserButton";
import { User } from "../types/records";


export default function Messages(): JSX.Element {
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
            setMessages((prevState) => prevState.filter((m) => m.id !== record.id)
            );
          }
        });
    };

    getMessages();

    return () => {
      if (unsubscribe)
        unsubscribe();
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
            user={message.expand.user}
            timestamp={new Date(message.created)} />
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
  text, user, timestamp,
}: {
  text: string;
  user: User;
  timestamp: Date;
}) {
  const [hover, setHover] = useState(false);

  function formatTimestamp() {

    // if the message was sent today, only show 'Today at 12:00:00'
    if (timestamp.toLocaleDateString() === new Date().toLocaleDateString()) {
      return `Today @ ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
    }
    // else if the message was sent yesterday, only show 'Yesterday at 12:00:00'
    else if (timestamp.toLocaleDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString()) {
      return `Yesterday @ ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
    }
    // else show the full date and time
    return `${timestamp.toLocaleDateString()} @ ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
  }

  return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Box bgcolor={hover ? grey[200] : ""} borderRadius={2} p={1}>
          <Stack direction="row" spacing={2}>
            <UserButton variant='icon' user={user}/>
            <Stack direction="column">
              <Stack direction="row" spacing={1}>
                <Typography variant="overline">{user.username}</Typography>
                <Typography variant="overline" sx={{opacity: 0.75}}>
                  {formatTimestamp()}
                </Typography>
              </Stack>
              <Typography variant="body1">{text}</Typography>
            </Stack>
          </Stack>
        </Box>
      </div>
  );
}
