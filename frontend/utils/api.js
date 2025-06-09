const { default: axios } = require("axios");
const { Router } = require("next/router");

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      Router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
