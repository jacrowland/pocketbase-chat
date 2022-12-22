import { Box, Stack } from "@mui/material";
import { grey } from "@mui/material/colors";
import useAppContext from "../hooks/useAppContext";
import { Server } from "../types/records";
import { ServerButton } from "./button/ServerButton";

export  default function ServerNavigation() {
  const { currentServer, memberships } = useAppContext();

  return (
    <Box minWidth={75} sx={{ backgroundColor: grey[900] }} overflow="auto">
      <Stack
        direction="column"
        spacing={1}
        mt={3}
        justifyItems="center"
        alignItems="center"
      >
        {memberships.map((membership) => (
          <ServerButton
            selected={currentServer?.id === membership.server}
            key={membership.id}
            name={(membership.expand.server as Server).name}
            id={membership.server} />
        ))}
      </Stack>
    </Box>
  );
}
