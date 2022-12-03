import Button from "@components/Button";
import Card from "@components/Card";
import CoverPicture from "@components/CoverPicture";
import Editor from "@components/Editor";
import withEditorContext from "@components/Editor/withLexicalContext";
import PageLoader from "@components/PageLoader";
import ProfilePicture from "@components/ProfilePicture";
import TierCard from "@components/TierCard";
import TierCardData from "@components/TierCardData";
import { CashIcon, XIcon } from "@heroicons/react/outline";
import { useAppStore } from "@store/app";
import clsx from "clsx";
import { useProfileLazyQuery, useProfileQuery } from "generated";
import { useRouter } from "next/router";
import NotFound from "pages/404";
import { useEffect, useState } from "react";

const Profile = () => {
  const {
    query: { username, type },
  } = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);

  const { data, loading, error } = useProfileQuery({
    variables: {
      request: { handle: username },
      who: currentProfile?.id ?? null,
    },
    skip: !username,
  });

  if (error) {
    return <div />;
  }

  if (loading || !data) {
    return <PageLoader />;
  }

  if (!data?.profile) {
    return <NotFound />;
  }

  const profile = data?.profile;
  return (
    <div
      data-theme="bg-onboard"
      className="bg-onboard text-white w-full flex flex-grow px-4 sm:px-8 flex-col"
    >
      <div className="relative sm:min-h-[300px]">
        <CoverPicture />
        <div className="absolute -bottom-8 left-1/4 sm:left-6 z-10">
          <ProfilePicture />
        </div>
      </div>
      <div className=" font-space-grotesek font-bold text-4xl mt-10">
        {profile.name}
      </div>
      <div className=" font-space-grotesek font-medium mt-3">{profile.bio}</div>
      <div className="border-b border-b-theme mt-5"></div>
      <div className="flex mt-7 lg:flex-nowrap flex-wrap-reverse">
        <Card className="mt-6 m-2 lg:m-0 w-full lg:w-3/5 border border-theme-user">
          <Editor
            isEditable={false}
            className="h-full"
            hidePlaceholder
            initialState={
              profile?.attributes?.filter(({ key }) => key === "about")?.[0]
                .value
            }
          />
        </Card>
        <TierCardData profile={profile} />
        {/* <TierCard handle="strek.lens" tiers={fields} viewOnly={false} /> */}
      </div>
      <div className="m-11 "></div>
    </div>
  );
};

export default Profile;
