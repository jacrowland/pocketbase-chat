import { Box, Stack } from "@mui/material";
import { grey } from "@mui/material/colors";
import useAppContext from "../hooks/useAppContext";
import { ServerButton } from "./button/ServerButton";

export  default function ServerNavigation() {
  const { memberships } = useAppContext();

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
            id={membership.server} />
        ))}
      </Stack>
    </Box>
  );
}
