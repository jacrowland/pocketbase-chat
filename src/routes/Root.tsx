import { Button } from "@mui/material";
import useAuthContext from "../hooks/useAuthContext";

export default function Root() {
    const { signOut } = useAuthContext();
    return (
        <div>
            <h1>Root</h1>
            <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
    );
}