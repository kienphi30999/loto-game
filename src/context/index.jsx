import React, { memo } from "react";
import { io } from "socket.io-client";

export const wsContext = React.createContext(null);

const socket = io("http://172.27.228.236:9999/", {
  path: "/ws/socket.io",
  transports: ["websocket"],
});

export function WebSocketConTextProvider({ children }) {
  const value = {
    socketio: socket,
  };

  React.useEffect(() => {
    socket.on("connect", (evt) => {
      console.log("CONNECT BE WS", socket.id);
    });

    socket.on("disconnect", (evt) => {
      console.log("DISCONNECT BE WS");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return <wsContext.Provider value={value.socketio}>{children}</wsContext.Provider>;
}
// export default WebSocketConTextProvider;
export default memo(WebSocketConTextProvider);
