import { useAppStore } from "@store/app";
import withAuthenticatedRoute from "@utils/withAuthenticatedRoute";
import { useProfileQuery } from "generated";
import getAvatar from "src/lib/getAvatar";

const Profile = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  console.log(currentProfile);
  return (
    <div className="container mx-auto max-w-screen-xl flex-grow pt-8 pb-2 px-0 sm:px-5 ">
      <div className="">
        <img
          src={getAvatar(currentProfile)}
          loading="lazy"
          className="w-10 h-10 bg-gray-200 rounded-full border dark:border-gray-700/80"
          height={40}
          width={40}
          alt={profile?.handle}
        />
        <div className="flex ">{currentProfile.name}</div>
        <div className="flex ">{currentProfile.avatar}</div>
      </div>
    </div>
  );
};

export default withAuthenticatedRoute(Profile);
