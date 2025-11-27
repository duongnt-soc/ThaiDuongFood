// import authService from "@/utils/auth";
// import { useEffect } from "react";

// const useAuthToken = () => {
//   useEffect(() => {
//     const scheduleTokenRefresh = () => {
//       const token = authService.getAccessToken();
//       if (!token) return;

//       const expiryTime = authService.getTokenExpiryTime(token);
//       if (!expiryTime) return;

//       const now = Date.now();
//       const timeout = expiryTime - now - 60000;

//       if (timeout > 0) {
//         setTimeout(async () => {
//           try {
//             await authService.handleRefreshToken();
//             scheduleTokenRefresh();
//           } catch (error) {
//             console.error("Failed to refresh token", error);
//           }
//         }, timeout);
//       } else {
//         authService
//           .handleRefreshToken()
//           .then(scheduleTokenRefresh)
//           .catch((error) => console.error("Failed to refresh token", error));
//       }
//     };
//     scheduleTokenRefresh();
//   }, []);
// };

// export default useAuthToken;
