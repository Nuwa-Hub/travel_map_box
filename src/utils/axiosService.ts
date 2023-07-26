import axios from "axios";

export const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_MATCHING_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});
