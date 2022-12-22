import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import Login from "./Login";
import Register from "./Register";
import Root from "./Root";

function AuthenticatedRoute() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Checking if user is logged in...", user);
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user]);

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthenticatedRoute />}>
        <Route index element={<Root />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
