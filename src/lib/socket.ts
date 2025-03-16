import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initializes the socket.io client with the given authentication token.
 * If the socket is already initialized, it will not be reinitialized.
 * @param token - The authentication token to use for the socket connection.
 * @returns The initialized socket.io client.
 */
export const initSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL, {
      query: { token },
    });
  }
  return socket;
};

/**
 * Disconnects the socket.io client from the server and
 * resets the socket instance to null.
 */

export const disconnectSocket = (): void => {
  if (socket) socket.disconnect();
  socket = null;
};
