import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Typography,
  Stack,
  Box,
  Grid,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { User } from "../../types/records";
import { UserAvatar } from "../UserAvatar";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileDialog({
  user,
  open,
  onClose,
}: ProfileDialogProps): JSX.Element {
  return (
    <Dialog fullWidth open={open}>
      <DialogTitle justifyContent="space-between" display="flex">
        Profile
        <CloseButton onClick={() => onClose()} />
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Box
            py={5}
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <UserAvatar
              avatarProps={{ sx: { width: 125, height: 125 } }}
              user={user}
            />
          </Box>
          <Grid container>
            <Grid item xs={6}>
              <UneditableField label="Username" value={user.username} />
            </Grid>
            <Grid item xs={6}>
              <UneditableField
                label="Account Created"
                value={new Date(user.created).toLocaleDateString()}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6}>
              <UneditableField label="Email" value={user.email} />
            </Grid>
            <Grid item xs={6}>
              <UneditableField
                label="Verified"
                value={user.verified ? "Yes" : "No"}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
      </DialogActions>
    </Dialog>
  );
}

function UneditableField({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <Box>
      <Typography variant="overline">{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

function CloseButton({
  onClick,
}: {
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
  ) => void;
}): JSX.Element {
  return (
    <IconButton onClick={(e) => onClick(e)}>
      <CloseIcon />
    </IconButton>
  );
}
