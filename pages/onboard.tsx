import AppearAnimation from "@components/AnimatedAppear";
import { Avatar } from "@components/Avatar";
import Card from "@components/Card";
import Editor from "@components/Editor";
import withEditorContext from "@components/Editor/withLexicalContext";
import NavBar from "@components/NavBar";
import BasicDetails from "@components/onboarding-form/BasicDetails";
import TierForm from "@components/onboarding-form/TierForm";
import { useAppStore } from "@store/app";
import { useState } from "react";
import withAuthenticatedRoute from "src/utils/withAuthenticatedRoute";

function OnBoard() {
  const currentProfile = useAppStore((state) => state.currentProfile);

  const [steps, setSteps] = useState(0);
  return (
    <div className="flex flex-grow  bg-onboard">
      <div className="flex justify-center items-center flex-col flex-grow bg-onboard-overlay">
        {steps === 0 && (
          <div className="magic-card">
            <Card className="ring-1 bg-gray-900  ring-slate-900/500 flex flex-col justify-center items-center onboard w-full h-full">
              <AppearAnimation className="flex flex-col justify-center items-center  flex-wrap sm:flex-nowrap">
                <Avatar size={12} src="/cryptster.svg" />
                <BasicDetails onComplete={setSteps} />
              </AppearAnimation>
            </Card>
          </div>
        )}
        {steps === 1 && (
          <div className="magic-card w-[50vw]">
            <Card className="ring-1 bg-gray-900  ring-slate-900/500 flex flex-col justify-center items-center onboard w-[50vw] h-full">
              <h2 className="text-white">Let People know what you do</h2>
              <Editor className="h-full lexical-about h-[500px]" />
            </Card>
          </div>
        )}
        {steps === 2 && (
          <AppearAnimation className="flex flex-col justify-center items-center w-4/5">
            <TierForm onComplete={setSteps} />
          </AppearAnimation>
        )}
      </div>
    </div>
  );
}

export default withAuthenticatedRoute(withEditorContext(OnBoard));
