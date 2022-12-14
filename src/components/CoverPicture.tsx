import { useAppStore } from "@store/app";
import ProfilePicture from "./ProfilePicture";

const CoverPicture = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  return (
    <div className="h-full">
      <img
        className="h-full object-cover w-full rounded-2xl max-h-[300px]"
        src="https://rarible.mypinata.cloud/ipfs/QmahqDp3zAG4tcQyxyAnB9fVJav9rrwBiFJedWHb4txkmE"
      />
    </div>
  );
};

export default CoverPicture;
