import {
  Box,
  IconButton, Tooltip
} from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import useAuthContext from "../../hooks/useAuthContext";

export default function SignOutButton() {
  const { signOut } = useAuthContext();

  return (
    <Box>
      <Tooltip title="Sign out">
        <IconButton sx={{ mr: 1 }} onClick={() => signOut()}>
          <MeetingRoomIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
