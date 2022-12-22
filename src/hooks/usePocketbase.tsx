import PocketBase  from "pocketbase";
import useAuthContext from "./useAuthContext";

import { pocketbase } from "../context/AuthContext";

export default function usePocketbase(): PocketBase {
    return pocketbase;
}