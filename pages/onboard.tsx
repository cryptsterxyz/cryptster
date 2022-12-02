import AppearAnimation from "@components/AnimatedAppear";
import { Avatar } from "@components/Avatar";
import Card from "@components/Card";
import NavBar from "@components/NavBar";
import BasicDetails from "@components/onboarding-form/BasicDetails";
import TierForm from "@components/onboarding-form/TierForm";
import { useState } from "react";
import withAuthenticatedRoute from "src/utils/withAuthenticatedRoute";

function OnBoard() {
  const [steps, setSteps] = useState(0);
  return (
    <div className="flex flex-grow  bg-onboard">
      <div className="flex justify-center items-center flex-col flex-grow bg-onboard-overlay">
        {steps === 0 && (
          <Card className="ring-1 bg-gray-900/50  ring-slate-900/500 flex flex-col justify-center items-center w-1/2">
            <AppearAnimation className="flex flex-col justify-center items-center">
              <Avatar size={12} src="/cryptster.svg" />
              <BasicDetails onComplete={setSteps} />
            </AppearAnimation>
          </Card>
        )}
        {steps === 1 && (
          <AppearAnimation className="flex flex-col justify-center items-center w-4/5">
            <TierForm onComplete={setSteps} />
          </AppearAnimation>
        )}
      </div>
    </div>
  );
}

export default withAuthenticatedRoute(OnBoard);
