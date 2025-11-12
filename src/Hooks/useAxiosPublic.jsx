import axios from "axios";

const axiosPublic = axios.create({
    baseURL: '/api',
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // optional: set timeout for requests
});

const useAxiosPublic = () => { return axiosPublic };

export default useAxiosPublic;
