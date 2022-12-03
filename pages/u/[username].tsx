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
  useEffect(() => {
    // document.documentElement.style.setProperty("--n", "219 14% 28%");
    // document.documentElement.style.setProperty("--nc", "0 0% 100%");
  }, []);
  const [fields, setFields] = useState([
    {
      amount: 1,
      comment: "",
      emoji: "💰",
    },
    {
      amount: 2,
      comment: "",
      emoji: "💰",
    },
    {
      amount: 5,
      comment: "",
      emoji: "💰",
    },
  ]);
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
      data-theme="user"
      className="w-full flex flex-grow px-4 sm:px-8 flex-col"
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
            viewOnly
            content="I love open source 💗
I got into open source in 2012. Two years later, I quit my office job to work on open source full-time while living off savings. I have been doing that for more than 6 years now. Since 2018, my open source work has been funded by the awesome community.
If you or your company use any of my projects or like what I’m doing, please consider backing me so I can continue maintaining and evolving all my projects and new ones. I'm in this for the long run.
I actively maintain 1100+ npm packages (2 billion downloads a month) and many popular projects. You're probably depending on some of my packages in your dependency tree. For example, Webpack (proof) and Babel (proof) rely on 100+ of my packages. Many large companies also rely on my packages.
You can read more about me in this interview and my AMA.
Thank you for your support! 🙌"
            className="min-h-[300px]"
          />
        </Card>
        <TierCardData profile={profile} />
        {/* <TierCard handle="strek.lens" tiers={fields} viewOnly={false} /> */}
      </div>
      <div className="m-11 "></div>
    </div>
  );
};

export default withEditorContext(Profile);
