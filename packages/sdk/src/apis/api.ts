import axios from "axios";

axios.interceptors.request.use(
  function (config) {
    config.headers.Authorization = `Bearer ${process.env.GANAKA_DEVELOPER_KEY}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export const api = axios;
