const { default: axios } = require("axios");
const { AxiosError } = require("./errors");

const axiosRequest = async (config) => {
  try {
    const result = await axios.request(config);
    return result.data;
  } catch (error) {
    throw new AxiosError(error);
  }
};

const axiosMethod = (method) => (config) =>
  axiosRequest({ proxy: false, ...config, method });

const get = axiosMethod("get");
const post = axiosMethod("post");
const put = axiosMethod("put");
const patch = axiosMethod("patch");
const del = axiosMethod("delete");

module.exports = {
  AxiosError,
  get,
  post,
  put,
  patch,
  del,
};
