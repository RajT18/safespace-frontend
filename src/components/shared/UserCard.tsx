import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { useFollowUser, useGetCurrentUser, useIsFollowing } from "@/lib/react-query/queries";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {

  const { data: currentUser } = useGetCurrentUser();
  const { mutateAsync: followUser } = useFollowUser();
  const { data: followingStatus } = useIsFollowing(user.$id, currentUser?.$id || "");
  const { isFollowing } = followingStatus || { isFollowing: false };

  const handleFollow = () => {
    if (currentUser?.$id !== user.$id && currentUser && currentUser.$id) {
      followUser({ userId: user.$id, currentUserId: currentUser.$id });
    }
  }


  return (
    <div className="user-card">

      <Link to={`/profile/${user.$id}`}>
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-14 h-14"
        />

        <div className="flex-center flex-col gap-1">
          <p className="base-medium text-light-1 text-center line-clamp-1">
            {user.name}
          </p>
          <p className="small-regular text-light-3 text-center line-clamp-1">
            @{user.username}
          </p>
        </div>

      </Link>
      {isFollowing ? (
        <Button type="button" onClick={() => handleFollow()} size="sm" className="shad-button_secondary px-5">
          Unfollow
        </Button>
      ) : (
        <Button type="button" onClick={() => handleFollow()} size="sm" className="shad-button_primary px-5">
          Follow
        </Button>
      )}
    </div>
  );
};

export default UserCard;
