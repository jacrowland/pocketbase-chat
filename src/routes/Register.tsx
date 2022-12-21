import {
  Alert,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "@mui/material/Link";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import usePocketbase from "../hooks/usePocketbase";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<ReactNode>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const pb = usePocketbase();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const login = async() => {
    await pb?.collection('users').authWithPassword(email, password);
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const data = {
            password: password,
            passwordConfirm: password,
            username: email,
            name: name,
        }

        console.log(data);

        await pb?.collection('users').create(data);
        await login();
        if (user) {
            console.log('Logged in!');
            setAlert(<Alert severity="success">Successfully registered and logged in</Alert>);
        }
    } catch (e) {
      console.error(e);
      setAlert(<Alert severity="error">An error occurred</Alert>);
    }
  };

  return (
    <Grid
      container
      minHeight="100vh"
      width="100vw"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={12} sm={10} md={6}>
        <form id="register-form" onSubmit={(e) => handleSignUp(e)}>
          <Stack direction="column" spacing={3}>
            <Typography variant="h5" textAlign="center">
              Register
            </Typography>
            {alert && alert}
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
              onChange={(e) => setName(e.target.value)}
              type="text"
              id="name"
              label="Name"
              variant="outlined"
              value={name}
            />
            <TextField
                required
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ minLength: 8, maxLength: 72 }}
              type="password"
              id="password"
              label="Password"
              variant="outlined"
              value={password}
            />
            <Stack spacing={1}>
              <Button variant="outlined" id="submit" type="submit">
                Sign up
              </Button>
              <Typography variant="subtitle2">
                Already have an account? <Link href="/login"> Sign in </Link>
              </Typography>
            </Stack>
          </Stack>
        </form>
      </Grid>
    </Grid>
  );
}
