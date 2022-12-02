import AppearAnimation from "@components/AnimatedAppear";
import { Avatar } from "@components/Avatar";
import NavBar from "@components/NavBar";
import BasicDetails from "@components/onboarding-form/BasicDetails";
import TierForm from "@components/onboarding-form/TierForm";
import { useState } from "react";
import withAuthenticatedRoute from "src/utils/withAuthenticatedRoute";

function OnBoard() {
  const [steps, setSteps] = useState(0);
  return (
    <div className="flex justify-center items-center flex-col flex-grow">
      {steps === 0 && (
        <AppearAnimation className="flex flex-col justify-center items-center w-1/2">
          <Avatar size={12} src="/cryptster.svg" />
          <BasicDetails onComplete={setSteps} />
        </AppearAnimation>
      )}
      {steps === 1 && (
        <AppearAnimation className="flex flex-col justify-center items-center w-4/5">
          <TierForm onComplete={setSteps} />
        </AppearAnimation>
      )}
    </div>
  );
}

export default withAuthenticatedRoute(OnBoard);
