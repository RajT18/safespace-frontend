import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  getUsers,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  deletePost,
  likePost,
  getUserById,
  updateUser,
  getRecentPosts,
  getInfinitePosts,
  searchPosts,
  savePost,
  deleteSavedPost,
  followUser,
  getUserFollowStats,
  checkIsFollowing,
  unfollowUser,
  sendMessage,
  getMessages,
  getFollowers,
  getUserDetails,
  createChatRoom,
  getChatRooms,
} from "@/lib/appwrite/api";
import { IMessage, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { useUserContext } from "@/context/AuthContext";

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// POST QUERIES
// ============================================================

export const useGetPosts = () => {
  const { user } = useUserContext();

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        documents: page.documents.filter((post: any) => post.creator.$id !== user.id)
      }))
    }),
    getNextPageParam: (lastPage: any) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  const { user } = useUserContext();

  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    select: (data) => ({
      ...data,
      documents: data?.documents.filter(post => post.creator.$id !== user.id)
    }),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  const { user } = useUserContext();

  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
    select: (data) => ({
      ...data,
      documents: data?.documents.filter(post => post.creator.$id !== user.id)
    })
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = (limit?: number) => {
  const { user } = useUserContext();
  const { id: currentUserId } = user;

  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: async () => {
      const users = await getUsers(limit);
      return {
        ...users,
        documents: users?.documents.filter((doc: any) => doc.$id !== currentUserId)
      };
    }
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};


// ============================================================
// FOLLOW QUERIES
// ============================================================

export const useFollowUser = () => {
  return useMutation({
    mutationFn: ({userId,currentUserId}:{userId:string,currentUserId:string}) => followUser(currentUserId, userId)
  });
};

export const useGetUserFollowStats = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOW_STATS, userId],
    queryFn: () => getUserFollowStats(userId),
  });
};

// ... existing code ...

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followId: string) => unfollowUser(followId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOW_STATS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    }
  });
};

export const useIsFollowing = (userId: string, currentUserId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_IS_FOLLOWING, userId, currentUserId],
    queryFn: () => checkIsFollowing(userId, currentUserId),
    enabled: !!userId && !!currentUserId,
  });
};

export const useGetFollowers = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWERS, userId],
    queryFn: () => getFollowers(userId),
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: (message: IMessage) => 
      sendMessage(message)
  });
};

export const useGetMessages = (chatRoomId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MESSAGES, chatRoomId],
    queryFn: () => getMessages(chatRoomId),
    enabled: !!chatRoomId,
  });
};

export const useGetUserDetails = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_DETAILS, userId],
    queryFn: () => getUserDetails(userId),
  });
};

export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (participants: string[]) => createChatRoom(participants),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CHAT_ROOMS]
      });
    }
  });
};

export const useGetChatRooms = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CHAT_ROOMS, userId],
    queryFn: () => getChatRooms(userId),
    enabled: !!userId
  });
};
