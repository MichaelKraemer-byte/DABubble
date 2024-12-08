export interface Member {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  status: boolean;
  channelIds: string[];
  ignoreList: string[];
}

export interface Channel {
  id: string | '';
  title: string | '';
  messages: [];
  membersId: [];
  admin: string;
  description: string | '';
  isPublic: boolean;
}

export interface Message {
  user: string,
  name: string,
  time: string,
  message: string,
  timestamp: number,
  profileImage: string,
  createdAt: string,
  reactions: {
    like: string[],
    rocket: string[]
  },
  attachment: string[]
}

export interface Thread {
  user: string,
  name: string,
  time: string,
  message: string,
  profileImage: string,
  createdAt: string,
  reactions: {
    like: string[],
    rocket: string[]
  },
  attachment: string[],
  threadId: string
}

export interface Attachment {

}
