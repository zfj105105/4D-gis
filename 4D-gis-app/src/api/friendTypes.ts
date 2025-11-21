// Friend related type definitions

export interface Friend {
  id: string;
  name: string;
  email: string;
  phone: string;
  mutualFriends?: number;
  createdAt?: Date;
}

export interface FriendRequest {
  id: string;
  name: string;
  mutualFriends: number;
  requestDate: Date;
  message?: string;
  senderId: string;
}

export interface SearchResult {
  id: string;
  name: string;
  mutualFriends: number;
  isFriend: boolean;
  isPending: boolean;
}

export interface SendFriendRequestRequest {
  targetUserId: string;
  message?: string;
}

export interface HandleFriendRequestRequest {
  requestId: string;
  accept: boolean;
}

