import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const useGetAllPost = () => {
    const dispatch = useDispatch();
    useEffect(() => {

        async function fetchAllPost() {
            try {
                const res = await axios.get("http://localhost:5500/post/all", { withCredentials: true });
                console.log("Fetched Posts:", res.data);
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    }, []);
};

export default useGetAllPost;