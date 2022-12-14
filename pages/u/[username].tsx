import Button from "@components/Button";
import Card from "@components/Card";
import CoverPicture from "@components/CoverPicture";
import Editor from "@components/Editor";
import getAvatar from "src/lib/getAvatar";
import withEditorContext from "@components/Editor/withLexicalContext";
import PageLoader from "@components/PageLoader";
import ProfilePicture from "@components/ProfilePicture";
import TierCard from "@components/TierCard";
import TierCardData from "@components/TierCardData";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { CashIcon, XIcon } from "@heroicons/react/outline";
import { useAppStore } from "@store/app";
import clsx from "clsx";
import { useProfileLazyQuery, useProfileQuery } from "generated";
import { useRouter } from "next/router";
import NotFound from "pages/404";
import { useEffect, useState } from "react";
import TOTAL_REVENUE from "@utils/totalRevenue";
import { useQuery } from "@apollo/client";

const Profile = () => {
  const {
    query: { username, type },
  } = useRouter();
  const { width, height } = useWindowSize();
  const [party, setParty] = useState(true);
  const currentProfile = useAppStore((state) => state.currentProfile);

  const { data, loading, error } = useProfileQuery({
    variables: {
      request: { handle: username },
      who: currentProfile?.id ?? null,
    },
    skip: !username,
  });

  const profile = data?.profile;

  const {
    data: totalRevenue,
    loading: totalRevenueLoading,
    error: totalRevenueError,
  } = useQuery(TOTAL_REVENUE, {
    variables: { profileId: profile?.id },
  });

  console.log("totalRevenue", totalRevenue?.profilePublicationRevenue?.items);

  if (error) {
    return <div />;
  }

  if (
    loading ||
    (!data &&
      profile?.attributes?.filter(({ key }) => key === "about")?.[0]?.value
        ?.length)
  ) {
    return <PageLoader />;
  }

  if (!data?.profile) {
    return <NotFound />;
  }

  return (
    <div
      data-theme="user"
      className="bg-onboard text-white w-full flex flex-grow px-4 sm:px-8 flex-col"
    >
      {party ? (
        <Confetti
          numberOfPieces={party ? 2000 : 0}
          recycle={false}
          onConfettiComplete={(confetti) => {
            setParty(false);
            confetti?.reset();
          }}
          width={width}
          height={height}
        />
      ) : null}
      <div className="relative sm:min-h-[300px]">
        <CoverPicture />
        <div className="absolute -bottom-8 left-2/4 -translate-x-[50px] z-10">
          {/* <ProfilePicture /> */}
          <div className="h-[142px] w-[142px] bg-white rounded-full flex justify-center items-center">
            <div className="max-h-[132px] max-w-[132px] rounded-full overflow-hidden">
              <img
                src={getAvatar(profile)}
                loading="lazy"
                alt={profile.handle}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto text-center">
        <div className=" font-space-grotesek font-bold text-4xl mt-10">
          {profile.name}
        </div>
        <div className=" font-space-grotesek font-semibold text-lg mt-2">
          @{profile.handle}
        </div>
        <div className=" font-space-grotesek font-medium mt-3 w-[510px]">
          {profile.bio}
        </div>
      </div>
      <div className="flex lg:flex-nowrap flex-wrap-reverse w-[80%] mt-5 mx-auto">
        <Card className="mt-6 m-2 lg:m-0 w-full lg:w-3/5 ring-1 bg-slate-900/60">
          <Editor
            isEditable={false}
            className="h-full"
            hidePlaceholder
            initialState={
              profile?.attributes?.filter(({ key }) => key === "about")?.[0]
                ?.value
            }
          />
        </Card>
        <TierCardData profile={profile} setParty={setParty} party={party} />
        {/* <TierCard handle="strek.lens" tiers={fields} viewOnly={false} /> */}
      </div>
      <div className="m-2"></div>
    </div>
  );
};

export default Profile;
