import { useAppStore } from "@store/app";
import getAvatar from "src/lib/getAvatar";

const ProfilePicture = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  return (
    <div className="h-[142px] w-[142px] bg-white rounded-full flex justify-center items-center">
      <div className="max-h-[132px] max-w-[132px] rounded-full overflow-hidden">
        <img
          src={getAvatar(currentProfile)}
          loading="lazy"
          alt={currentProfile?.handle}
        />
      </div>
    </div>
  );
};

export default ProfilePicture;
