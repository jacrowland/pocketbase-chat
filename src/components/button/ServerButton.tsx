import {
  Avatar,
  Box, IconButton, Tooltip
} from "@mui/material";
import useAppContext from "../../hooks/useAppContext";

interface ServerButtonProps {
  name: string;
  id: string;
  selected?: boolean;
}

export function ServerButton({ name, id, selected = false }: ServerButtonProps): JSX.Element {
  const { updateLocation } = useAppContext();

  const handleClick = () => {
    updateLocation(id);
  };

  return (
    <Box p={1} sx={{borderLeft: selected ? '2px solid white': ''}}>
      <Tooltip title={name} placement="right">
        <IconButton onClick={() => handleClick()}>
          <ServerAvatar name={name} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export function ServerAvatar({ name }: { name: string }): JSX.Element {
  return (
    <Avatar>{name[0].toLocaleUpperCase()}</Avatar>
  );
}
