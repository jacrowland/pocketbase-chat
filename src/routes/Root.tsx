import {
  Box,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import useAppContext from "../hooks/useAppContext";
import { ChannelContent } from "../components/ChannelContent";
import ChannelNavigation from "../components/ChannelNavigation";
import MembersList from "../components/MembersList";
import ServerNavigation from "../components/ServerNavigation";
import Typography from "@mui/material/Typography";

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