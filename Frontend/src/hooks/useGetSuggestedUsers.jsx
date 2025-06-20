import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    useEffect(() => {

        async function fetchSuggestedUsers() {
            try {
                const res = await axios.get("https://circleup-3wqg.onrender.com/user/suggested", { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSuggestedUsers();
    }, []);
};

export default useGetSuggestedUsers;