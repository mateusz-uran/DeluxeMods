import { BACKEND_URL } from "./config.client";

import {
  default as axios,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from "axios";

const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
