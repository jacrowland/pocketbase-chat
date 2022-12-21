import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";

export default function SectionHeader({
  title, color = "white",
}: {
  title: string;
  color?: "white" | "black";
}): JSX.Element {
  return (
    <Box py={2} width="100%" bgcolor={grey[200]}>
      <SectionTitle title={title} color={color} />
    </Box>
  );
}
function SectionTitle({
  title, color = "white",
}: {
  title: string;
  color?: "white" | "black";
}): JSX.Element {
  return (
    <Typography p={2} fontWeight="bold" variant="overline" color={color}>
      {title}
    </Typography>
  );
}
