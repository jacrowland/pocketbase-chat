import {
  Avatar,
  Box, IconButton, Tooltip
} from "@mui/material";
import useAppContext from "../../hooks/useAppContext";

export function ServerButton({ name, id }: { name: string; id: string; }): JSX.Element {
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
