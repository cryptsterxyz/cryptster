import { useAppStore } from "@store/app";
import { useEffect, useState } from "react";
import getIPFSLink from "src/lib/getIPFSLink";
import imageProxy from "src/lib/imageProxy";
import ProfilePicture from "./ProfilePicture";

const CoverPicture = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [cover, setCover] = useState("");
  useEffect(() => {
    if (currentProfile?.coverPicture?.original?.url) {
      setCover(currentProfile?.coverPicture?.original?.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full">
      <img
        className="h-full object-cover w-full rounded-2xl max-h-[300px]"
        src={imageProxy(getIPFSLink(cover), "cover")}
      />
    </div>
  );
};

export default CoverPicture;
