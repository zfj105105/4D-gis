// Friend API functions
import api from './api';
import type {
  Friend,
  FriendRequest,
  SearchResult,
  SendFriendRequestRequest,
  HandleFriendRequestRequest
} from './friendTypes';

// Get friends list
export const fetchFriends = async (): Promise<Friend[]> => {
  const response = await api.get<Friend[]>('/friends');
  return response.data;
};

// Get friend requests list
export const fetchFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await api.get<FriendRequest[]>('/friends/requests');
  return response.data.map(request => ({
    ...request,
    requestDate: new Date(request.requestDate)
  }));
};

// Search users
export const searchUsers = async (query: string): Promise<SearchResult[]> => {
  const response = await api.get<SearchResult[]>('/friends/search', {
    params: { query }
  });
  return response.data;
};

// Send friend request
export const sendFriendRequest = async (data: SendFriendRequestRequest): Promise<void> => {
  await api.post('/friends/request', data);
};

// Accept or reject friend request
export const handleFriendRequest = async (data: HandleFriendRequestRequest): Promise<void> => {
  await api.post('/friends/request/handle', data);
};

// Remove friend
export const removeFriend = async (friendId: string): Promise<void> => {
  await api.delete(`/friends/${friendId}`);
};

