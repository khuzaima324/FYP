// import axios from "axios";

// export const BASE_URL = "http://localhost:5000/api"; // base API endpoint

// export const ApiCall = async ({ route, verb = "GET", data = null, token = null }) => {
//   try {
//     const url = `${BASE_URL}/${route}`;
//     const headers = {};

//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }

//     const response = await axios({
//       method: verb,
//       url,
//       data,
//       headers,
//     });

//     return response.data;
//   } catch (error) {
//     console.error(
//       "API Error:",
//       error.response?.data?.message || error.response?.data || error.message
//     );
//     throw error.response?.data || { message: "Something went wrong" };
//   }
// };

// await ApiCall({
//   route: "students",
//   verb: "post",
//   data: formData,
//   token, // send token here
// });


import axios from "axios";

export const BASE_URL = "http://localhost:5000/api"; // Base API endpoint

export const ApiCall = async ({ route, verb = "GET", data = null, token = null, params = null }) => {
  try {
    const url = `${BASE_URL}/${route}`;
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios({
      method: verb,
      url,
      data,
      params, // used for GET queries
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(
      "API Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || { message: "Something went wrong" };
  }
};
