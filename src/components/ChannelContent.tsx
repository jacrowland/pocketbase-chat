import {
  Box, Button,
  Stack,
  TextField,
  Tooltip
} from "@mui/material";
import useAuthContext from "../hooks/useAuthContext";
import { grey } from "@mui/material/colors";
import { useState } from "react";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import Messages from "./Messages";
import SectionHeader from "./SectionHeader";

export function ChannelContent() {
  const { currentChannel } = useAppContext();
  return (
    <Box minWidth={500} flexGrow={1} sx={{ backgroundColor: grey[100] }}>
      <Stack direction="column" height="100%" justifyContent="space-between">
        <Box borderBottom={`1px solid ${grey[300]}`}>
          <SectionHeader title={`# ${currentChannel?.name}`} color="black" />
        </Box>
        <Messages />
        <SendMessageInput />
      </Stack>
    </Box>
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
          variant="outlined" />
        <Box display='flex' justifyContent='center' alignItems='center'>
            <Button sx={{height: '100%'}} fullWidth type="submit" variant="outlined" color="primary">
              Send
            </Button>
        </Box>
      </Stack>
    </form>
  );
}
