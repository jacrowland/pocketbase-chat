import { Avatar } from "@mui/material";
import { User } from "../types/records";

interface UserAvatarProps {
  user: User;
  avatarProps?: any;
}

export const UserAvatar = ({ user, avatarProps = {} }: UserAvatarProps) => {
  return (
    <Avatar {...avatarProps}>
      {user.username.length > 0 ? user.username[0].toUpperCase() : 'U'}
    </Avatar>
  );
};
