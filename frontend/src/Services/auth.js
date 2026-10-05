import api from "./api";

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

export const logoutCurrentUser = ()=>{
  return api.post('/auth/logout')
};