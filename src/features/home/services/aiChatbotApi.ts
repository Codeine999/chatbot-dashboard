import { http } from "@/lib/http"
import axios from "axios"

export const getAiChatbot = async (input: string) => {
    try {
        const response = await axios.post(`${http}/message/send`, {
            message: input
        });
        console.log(response)
        return response.data;
    } catch (err) {
        console.log(err)
    }
}