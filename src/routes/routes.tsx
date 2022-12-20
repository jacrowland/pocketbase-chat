import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import Login from "./Login";
import Register from "./Register";
import Root from "./Root";


function AuthenticatedRoute() {
    const { user } = useAuthContext();

    if (!user) {
        return <Navigate to="/login" />
    }
    
    return <Outlet/>
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AuthenticatedRoute />}>
                <Route index element={<Root/>} />
            </Route>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
        </Routes>
    );
}

