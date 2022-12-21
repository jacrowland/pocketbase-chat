import PocketBase  from "pocketbase";
import useAuthContext from "./useAuthContext";

export default function usePocketbase(): PocketBase {
    const { pocketbase } = useAuthContext();
    return pocketbase;
}