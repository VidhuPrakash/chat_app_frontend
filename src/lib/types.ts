// user type
export interface User {
  _id: string;
  username: string;
  email?: string;
  online?: boolean;
}

//group type
export interface Group {
  _id: string;
  name: string;
}

// message type
export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// group message type
export interface GroupMessage {
  _id: string;
  sender: string;
  senderUsername: string;
  group: string;
  message: string;
  readBy: string[];
  createdAt: string;
}

// auth response type
export interface AuthResponse {
  status: number;
  message: string;
  data: { token: string; user?: User };
  error: Array<{ field: string; message: string }> | null;
}

// message response type
export interface MessageResponse {
  status: boolean;
  message: string;
  data: Message | Message[];
  error: string | null;
}

// group message response type
export interface GroupMessageResponse {
  status: boolean;
  message: string;
  data: GroupMessage | GroupMessage[];
  error: string | null;
}
