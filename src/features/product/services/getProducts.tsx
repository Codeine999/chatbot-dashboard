import axios from "axios";
import { http } from "@/lib/http";

export const getProducts = async () => {
    try {
        const response = await axios.get(`${http}/product/get-all`)
        return response.data;
        
    } catch (err) {
        return null;
    }
}