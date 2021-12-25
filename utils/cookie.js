import Cookies from "js-cookie";

// for server side cookie fetching
export const getCookie = async (cookiename, cookiestring) => {
   if (!cookiestring) return Cookies.get(cookiename);
   const name = cookiename + "=";
   const decodedCookie = decodeURIComponent(cookiestring);
   const cookieArray = decodedCookie.split(";");
   for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === " ") {
         cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0)
         return cookie.substring(name.length, cookie.length);
   }
   return "";
};

export const setCookie = (cookiename, cookievalue) => {
   Cookies.set(cookiename, cookievalue, { expires: 14 });
};

export const removeCookie = (cookiename) => {
   Cookies.remove(cookiename);
};
