import {
  Box, ListItemButton,
  Stack
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import usePocketbase from "../hooks/usePocketbase";
import useAppContext from "../hooks/useAppContext";
import { Record } from "pocketbase";
import { UserButton } from "./button/UserButton";
import SectionHeader from "./SectionHeader";
import { User } from "../types/records";

export default function MembersList(): JSX.Element {
  const pb = usePocketbase();
  const { currentServer } = useAppContext();
  const [members, setMembers] = useState<Record[]>([]);

  useEffect(() => {
    const getMembers = async () => {
      const members = await pb
        .collection("memberships")
        .getFullList(undefined, {
          filter: `server = "${currentServer?.id}"`,
          expand: "user",
        });
      setMembers(members);
    };
    getMembers();
  }, [currentServer]);

  return (
    <Box minWidth={275} bgcolor={grey[300]}>
      <SectionHeader title={`Members (${members.length})`} color="black" />
      <Stack direction="column" spacing={1} p={1}>
        {members.length > 0 &&
          members.map((member) => (
              <UserButton key={member.id} user={member.expand.user as User} />
          ))}
      </Stack>
    </Box>
  );
}
