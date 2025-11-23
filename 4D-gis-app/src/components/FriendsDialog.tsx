import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  Users, 
  UserPlus, 
  Search, 
  Check, 
  X, 
  Trash2,
  Clock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFriends,
  fetchFriendRequests,
  searchUsers,
  sendFriendRequest,
  handleFriendRequest,
  removeFriend
} from '../api/friend';
import type { Friend, FriendRequest, SearchResult } from '../api/friendTypes';

interface FriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsDialog({ open, onOpenChange }: FriendsDialogProps) {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);
  const queryClient = useQueryClient();

  // Fetch friends list
  const { data: friends = [], isLoading: friendsLoading } = useQuery<Friend[]>({
    queryKey: ['friends'],
    queryFn: fetchFriends,
    enabled: open,
  });

  // Fetch friend requests
  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery<FriendRequest[]>({
    queryKey: ['friendRequests'],
    queryFn: fetchFriendRequests,
    enabled: open,
  });

  // Search users mutation
  const searchMutation = useMutation({
    mutationFn: searchUsers,
    onSuccess: () => {
      // Search results are handled in the mutation result
    },
    onError: (error) => {
      console.error('搜索失败:', error);
      toast.error('搜索失败，请重试');
    }
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success('好友请求已发送');
      // Optionally refetch search results to update isPending status
      if (searchQuery) {
        handleSearch();
      }
    },
    onError: (error: any) => {
      console.error('发送好友请求失败:', error);
      const message = error?.response?.data?.message || '发送好友请求失败';
      toast.error(message);
    }
  });

  // Handle friend request mutation (accept/reject)
  const handleRequestMutation = useMutation({
    mutationFn: handleFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      console.error('处理好友请求失败:', error);
      toast.error('处理好友请求失败，请重试');
    }
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setFriendToDelete(null);
      toast.success('好友已删除');
    },
    onError: (error) => {
      console.error('删除好友失败:', error);
      toast.error('删除好友失败，请重试');
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    searchMutation.mutate(searchQuery);
  };

  const handleAcceptRequest = (requestId: string) => {
    handleRequestMutation.mutate(
      { requestId, accept: true },
      {
        onSuccess: () => {
          const request = friendRequests.find(r => r.id === requestId);
          toast.success(`${request?.name} 已成为你的好友！`);
        }
      }
    );
  };

  const handleRejectRequest = (requestId: string) => {
    handleRequestMutation.mutate(
      { requestId, accept: false },
      {
        onSuccess: () => {
          const request = friendRequests.find(r => r.id === requestId);
          toast.success(`已拒绝 ${request?.name} 的好友请求`);
        }
      }
    );
  };

  const handleSendRequest = (userId: string, userName: string) => {
    sendRequestMutation.mutate({ targetUserId: userId });
  };

  const handleRemoveFriend = (friend: Friend) => {
    setFriendToDelete(friend);
  };

  const confirmRemoveFriend = () => {
    if (friendToDelete) {
      removeFriendMutation.mutate(friendToDelete.id);
    }
  };

  const searchResults = searchMutation.data || [];
  const isSearching = searchMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[90vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="friends" className="relative">
              Friends
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {friends.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {friendRequests.length > 0 && (
                <Badge className="ml-1 h-5 min-w-5 text-xs bg-red-500">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="add">
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </TabsTrigger>
          </TabsList>

          {/* Friends List Tab */}
          <TabsContent value="friends" className="flex-1 overflow-hidden mt-4 data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="flex-1 h-full">
              <div className="px-6 pb-6 space-y-2">
                {friendsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No friends yet</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('add')}
                      className="mt-2"
                    >
                      Add your first friend
                    </Button>
                  </div>
                ) : (
                  friends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(friend.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{friend.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.phone}
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveFriend(friend)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Friend Requests Tab */}
          <TabsContent value="requests" className="flex-1 overflow-hidden mt-4 data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="flex-1 h-full">
              <div className="px-6 pb-6 space-y-2">
                {requestsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : friendRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No pending requests</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Friend requests will appear here
                    </p>
                  </div>
                ) : (
                  friendRequests.map(request => (
                    <div
                      key={request.id}
                      className="p-4 bg-secondary/50 rounded-lg space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10">
                            {getInitials(request.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{request.name}</p>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {request.mutualFriends} mutual friends
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {request.message && (
                        <div className="pl-15 pr-2">
                          <p className="text-sm text-muted-foreground italic">
                            "{request.message}"
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={handleRequestMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={handleRequestMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Add Friends Tab */}
          <TabsContent value="add" className="flex-1 overflow-hidden mt-4 data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="flex-1 h-full">
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Search by username or email
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Search Results</p>
                      {searchResults.map(result => (
                        <div
                          key={result.id}
                          className="p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10">
                                {getInitials(result.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{result.name}</p>
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {result.mutualFriends} mutual friends
                                </Badge>
                              </div>
                            </div>

                            {result.isFriend ? (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                Friends
                              </Badge>
                            ) : result.isPending ? (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                Pending
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSendRequest(result.id, result.name)}
                                className="flex-shrink-0"
                                disabled={sendRequestMutation.isPending}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && searchMutation.isSuccess && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                )}

                {!searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Search for people to add as friends
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try searching by username or email
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!friendToDelete} onOpenChange={(open: any) => !open && setFriendToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friendToDelete?.name} from your friends? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFriend}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeFriendMutation.isPending}
            >
              {removeFriendMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
