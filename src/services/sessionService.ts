import axios from "axios";

export const scanQRCode = async (code: string) => {
  const { data } = await axios.post("/api/sessions/create", { code });
  return data.data;
};
