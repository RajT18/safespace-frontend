export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",

  // POST KEYS
  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",

  //  SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",

  // FOLLOW KEYS
  GET_USER_FOLLOW_STATS = "getUserFollowStats",

  GET_IS_FOLLOWING = "getIsFollowing",

  GET_FOLLOWERS = "getFollowers",

  // Chat KEYS
  GET_MESSAGES = "getMessages",
  SEND_MESSAGE = "sendMessage",
  GET_USER_DETAILS= "getUserDetails",
  GET_CHAT_ROOMS = "getChatRooms",
}
