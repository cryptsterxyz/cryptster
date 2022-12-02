import { useState } from "react";
import Button from "@components/Button";
import Card from "./Card";
import clsx from "clsx";
import { XIcon } from "@heroicons/react/outline";
import { tier } from "./onboarding-form/TierForm";

interface TierProps {
  tiers: Array<tier>;
  handle: string;
  activeTier?: number;
  viewOnly?: boolean;
}

const TierCard = ({
  handle,
  activeTier = 0,
  tiers,
  viewOnly = true,
}: TierProps) => {
  const [currentTier, setCurrentTier] = useState(activeTier);

  return (
    <Card className=" m-2 z-10 bg-transparent border border-theme py-5 my-auto xl:mt-18 w-full lg:w-2/5">
      <h2 className="h-auto font-bold text-xl flex-grow-0 sm:text-2xl ">
        Gift {handle} some crypto
      </h2>
      <p className="h-auto min-h-12 py-2 flex-grow-0">{tiers[currentTier].comment}</p>
      <Card className="rounded-md border border-theme w-full flex items-center bg-theme">
        <div className="flex justify-center items-center">
          <div className="text-[50px]">{tiers[currentTier].emoji}</div>
          <p className="ml-3 text-theme">
            <XIcon className="w-7 h-7 outline-1 dark:text-white text-theme" />
          </p>
          <div className="flex flex-wrap">
            {tiers.map(({ amount }, _index) => (
              <button
                onClick={() => {
                  !viewOnly && setCurrentTier(_index);
                }}
                className={clsx(
                  _index === currentTier
                    ? "bg-theme-darker text-primary-content"
                    : "border border-theme bg-white text-gray-800",
                  "m-1 sm:m-2 h-10 w-10 rounded-full flex justify-center items-center"
                )}
                key={amount}
              >
                <span>{amount}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      <div className="card-actions">
        <Button
          className="capitalize w-full button-primary border-theme"
          onClick={() => {
            !viewOnly && alert(tiers[currentTier].amount);
          }}
        >
          Gift {tiers[currentTier].amount}
        </Button>
      </div>
    </Card>
  );
};

export default TierCard;
