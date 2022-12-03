import WalletSelector from "../Login/WalletSelector";
import { IS_MAINNET } from "../../../utils/constants";
import type { FC } from "react";
import { useState } from "react";

const Login: FC = () => {
  const [hasConnected, setHasConnected] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  return (
    <div className="p-5  text-white">
      {hasProfile ? (
        <div className="space-y-5">
          {hasConnected ? (
            <div className="space-y-1">
              <div className="text-xl font-bold">Please sign the message.</div>
              <div className="text-sm text-gray-500">
                Cryptster uses this signature to verify that you&rsquo;re the
                owner of this address.
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xl font-bold text-gray-800">
                Connect your wallet.
              </div>
              <div className="text-sm text-gray-800">
                Connect with one of our available wallet providers or create a
                new one.
              </div>
            </div>
          )}
          <WalletSelector
            setHasConnected={setHasConnected}
            setHasProfile={setHasProfile}
          />
        </div>
      ) : IS_MAINNET ? (
        <div className="mb-2 space-y-4">
          <div className="text-xl font-bold">Claim your Lens profile 🌿</div>
          <div className="space-y-1">
            <div className="linkify">
              Visit{" "}
              <a
                className="font-bold"
                href="https://claim.lens.xyz"
                target="_blank"
                rel="noreferrer noopener"
              >
                claiming site
              </a>{" "}
              to claim your profile now 🏃‍♂️
            </div>
            <div className="text-sm text-gray-500">
              Make sure to check back here when done!
            </div>
          </div>
        </div>
      ) : (
        <h1>New profile</h1>
      )}
    </div>
  );
};

export default Login;
