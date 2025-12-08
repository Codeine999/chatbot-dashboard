import axios from "axios";
import { http } from "@/lib/http";

export const getProducts = async (page: number = 1, pageSize: number = 7) => {
    try {
        const response = await axios.get(`${http}/product/get-all`, {
            params: { page, pageSize }
        });
        return response.data;
    } catch (err) {
        return null;
    }
}
