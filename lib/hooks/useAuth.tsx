import Router from "next/router";
import { useEffect } from "react";
import { k } from "../constants";

export const useAuth = () => {
  useEffect(() => {
    const apiKey = localStorage.getItem(k.API_KEY_KEY);
    if (!apiKey && Router.route !== "/") {
      Router.replace("/");
    } else if (apiKey && Router.route === "/") {
      Router.replace("/dashboard");
    }
  }, []);
};
