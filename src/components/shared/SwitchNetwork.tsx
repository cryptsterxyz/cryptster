import { Button } from "@components/Button";
import type { FC } from "react";
import toast from "react-hot-toast";
import { CHAIN_ID } from "../../utils/constants";
import { useSwitchNetwork } from "wagmi";
import Switch from "@components/icons/Switch";

interface Props {
  className?: string;
}

const SwitchNetwork: FC<Props> = ({ className = "" }) => {
  const { switchNetwork } = useSwitchNetwork();

  return (
    <Button
      className={className}
      type="button"
      onClick={() => {
        if (switchNetwork) {
          switchNetwork(CHAIN_ID);
        } else {
          toast.error("Please change your network wallet!");
        }
      }}
    >
      <Switch className="h-4 w-4 mr-2"/>
      Switch Network
    </Button>
  );
};

export default SwitchNetwork;
