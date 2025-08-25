import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;

const Api = {
    get: async (url, headers, params) => {
        try {
            const response = await axios.get(url, { params }, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    post: async (url, headers, data) => {
        try {
            const response = await axios.post(url, data, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    put: async (url, headers, data) => {
        try {
            const response = await axios.put(url, data, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    delete: async (url, headers) => {
        try {
            const response = await axios.delete(url, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },
}

export default Api;