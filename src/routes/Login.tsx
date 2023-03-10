import { Alert, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import Link from "@mui/material/Link";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import usePocketbase from "../hooks/usePocketbase";

export default function Login() {
  const { user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<ReactNode>(null);
  const pb = usePocketbase();
  const navigate = useNavigate();

  const handleLogin = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        if (pb.authStore.isValid) {
            console.log('Logged in!');
            setAlert(<Alert severity="success">Successfully logged in</Alert>);
        }
        navigate('/');
    }
    catch (e) {
        console.error(e);
        setAlert(<Alert severity="error">An error occurred</Alert>);
    }
  };

  return (
      <Grid bgcolor={grey[900]} container minHeight='100vh' width='100vw' justifyContent="center" alignItems="center">
        <Grid item xs={10} sm={10} md={3} bgcolor={grey[200]} p={5}>
          <form id="login-form" onSubmit={(e) => handleLogin(e)}>
            <Stack direction="column" spacing={3}>
              <Typography variant="h5" textAlign="center">
                Login
              </Typography>
              { alert && alert }
              <TextField
                required
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                label="Email"
                variant="outlined"
                value={email}
              />
              <TextField
                required
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                label="Password"
                variant="outlined"
                value={password}
              />
              <Stack spacing={1}>
                <Button variant="outlined" id="submit" type="submit">
                  Login
                </Button>
                <Typography variant="subtitle2">
                  Need an account? <Link href="/register"> Sign up </Link>
                </Typography>
              </Stack>
            </Stack>
          </form>
        </Grid>
      </Grid>
  );
}