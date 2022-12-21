import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useAppContext from "../../hooks/useAppContext";
import useAuthContext from "../../hooks/useAuthContext";
import { useState } from "react";
import usePocketbase from "../../hooks/usePocketbase";

interface AddChannelDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddChannelDialog({
  open,
  onClose,
}: AddChannelDialogProps): JSX.Element {
  const [text, setText] = useState<string>("");
  const { currentServer } = useAppContext();
  const { user } = useAuthContext();
  const pb = usePocketbase();

  const handleSubmit = async () => {
    try {
        const data = {
            name: text,
            server: currentServer?.id,
            createdBy: user?.id,
        }
        console.log(data);
      await pb.collection("channels").create(data);
      onClose();
    } catch {}
  };

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle justifyContent="space-between" display="flex">
        Add Channel
        <IconButton onClick={() => onClose()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" width="100%" mb={1}>
          <Box width="50%">
            <Typography variant="overline">Server</Typography>
            <Typography variant="body1">{currentServer?.name}</Typography>
          </Box>
          <Box width="50%">
            <Typography variant="overline">User</Typography>
            <Typography variant="body1">{user?.username}</Typography>
          </Box>
        </Stack>

        <Typography variant="overline">Channel Name</Typography>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="My Channel"
          fullWidth
          id="channel-name"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => onClose()}>
          Cancel
        </Button>
        <Button onClick={() => handleSubmit()}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
