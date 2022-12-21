import { IconButton, ListItemButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { User } from "../types/records";
import ProfileDialog from "./dialogs/ProfileDialog";
import { UserAvatar } from "./UserAvatar";

interface UserProps {
  user: User;
  variant?: "icon" | "list";
}

export function UserButton({ user, variant = "list" }: UserProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const getButton = () => {
    if (variant === "icon") {
      return (
        <IconButton onClick={() => setOpen(true)}>
          <UserAvatar user={user} />
        </IconButton>
      );
    }
    return (
      <ListItemButton onClick={() => setOpen(true)}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <UserAvatar user={user} />
          <Typography>{user.username}</Typography>
        </Stack>
      </ListItemButton>
    );
  };

  return (
    <>
      {getButton()}
      <ProfileDialog open={open} onClose={() => setOpen(false)} user={user} />
    </>
  );
}
