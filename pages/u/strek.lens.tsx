import Button from "@components/Button";
import Card from "@components/Card";
import CoverPicture from "@components/CoverPicture";
import Editor from "@components/Editor";
import withEditorContext from "@components/Editor/withLexicalContext";
import ProfilePicture from "@components/ProfilePicture";
import TierCard from "@components/TierCard";
import { CashIcon, XIcon } from "@heroicons/react/outline";
import clsx from "clsx";
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
  return (
    <div data-theme="user" className="w-full flex flex-grow px-4 sm:px-8 flex-col">
      <div className="relative sm:min-h-[300px]">
        <CoverPicture />
        <div className="absolute -bottom-8 left-1/4 sm:left-6 z-10">
          <ProfilePicture />
        </div>
      </div>
      <div className=" font-space-grotesek font-bold text-4xl mt-10">
        Harish
      </div>
      <div className=" font-space-grotesek font-medium mt-3">
        요기 • Creator of @cryptster.lens 🌸 • Bullish on Ξ • BTS Fanboi ⟬⟭ •
        he/him 🌳
      </div>
      <div className="border-b border-b-gray-500 mt-5"></div>
      <div className="flex mt-7 lg:flex-nowrap flex-wrap-reverse">
        <Card className="mt-6 m-2 lg:m-0 w-full lg:w-3/5 border border-theme-user">
          <Editor />
        </Card>
        <TierCard handle="strek.lens" tiers={fields} viewOnly={false} />
      </div>
    </div>
  );
};

export default withEditorContext(Profile);
