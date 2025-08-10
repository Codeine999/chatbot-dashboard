import axios from 'axios';
import { http } from '@/lib/http';
export const getOrder = async () => {
    try {
        const response = await axios.get(`${http}/order/get-all`);
        return response.data;

    } catch (err) {
        console.log(err);
    }
}