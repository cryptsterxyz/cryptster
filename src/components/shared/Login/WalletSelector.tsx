import SwitchNetwork from "../SwitchNetwork";
import Button from "@components/Button";
import useIsMounted from "../../../utils/hooks/useIsMounted";
import LensImage from "@components/icons/lens.png";
import onError from "../../../utils/onError";
import clsx from "clsx";
// import { ERROR_MESSAGE } from "data/constants";
import {
  useAuthenticateMutation,
  useChallengeLazyQuery,
  useUserProfilesLazyQuery,
} from "../../../../generated";
import type { Dispatch, FC } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CHAIN_ID } from "../../../utils/constants";
import { useAppPersistStore, useAppStore } from "../../../store/app";
import type { Connector } from "wagmi";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { Spinner } from "@components/icons/Spinner";

interface Props {
  setHasConnected: Dispatch<boolean>;
  setHasProfile: Dispatch<boolean>;
}

const WalletSelector: FC<Props> = ({ setHasConnected, setHasProfile }) => {
  const setProfiles = useAppStore((state) => state.setProfiles);
  const profiles = useAppStore((state) => state.profiles);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const [loading, setLoading] = useState(false);

  const { mounted } = useIsMounted();
  const { chain } = useNetwork();
  const { connectors, error, connectAsync } = useConnect();
  console.log("connectttt", connectors, error, connectAsync);
  const { address, connector: activeConnector } = useAccount();
  const { signMessageAsync } = useSignMessage({ onError });
  const [loadChallenge, { error: errorChallenge }] = useChallengeLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [authenticate, { error: errorAuthenticate }] =
    useAuthenticateMutation();
  const [getProfiles, { error: errorProfiles }] = useUserProfilesLazyQuery();

  const onConnect = async (connector: Connector) => {
    try {
      const account = await connectAsync({ connector });
      console.log("connecttttttt", account);
      if (account) {
        setHasConnected(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSign = async () => {
    try {
      setLoading(true);
      // Get challenge
      const challenge = await loadChallenge({
        variables: { request: { address } },
      });

      if (!challenge?.data?.challenge?.text) {
        return toast.error("ERROR_MESSAGE");
      }

      // Get signature
      const signature = await signMessageAsync({
        message: challenge?.data?.challenge?.text,
      });

      // Auth user and set cookies
      const auth = await authenticate({
        variables: { request: { address, signature } },
      });
      localStorage.setItem("accessToken", auth.data?.authenticate.accessToken);
      localStorage.setItem(
        "refreshToken",
        auth.data?.authenticate.refreshToken
      );

      // Get authed profiles
      const { data: profilesData } = await getProfiles({
        variables: { ownedBy: address },
      });

      console.log("connecttttttttttt", profilesData);
      if (profilesData?.profiles?.items?.length === 0) {
        setHasProfile(false);
      } else {
        const profiles: any = profilesData?.profiles?.items
          ?.slice()
          ?.sort((a: any, b: any) => Number(a.id) - Number(b.id))
          ?.sort((a: any, b: any) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
          );
        const currentProfile = profiles[0];
        setProfiles(profiles);
        setCurrentProfile(currentProfile);
        setProfileId(currentProfile.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  console.log("connectttttttttttprofiless", profiles);

  return activeConnector?.id ? (
    <div className="space-y-3">
      {chain?.id === CHAIN_ID ? (
        <Button
          disabled={loading}
          icon={
            loading ? (
              <Spinner className="mr-2" size="xs" />
            ) : (
              <img
                className="mr-2 w-4 h-4"
                height={16}
                width={16}
                src="/lens.png"
                alt="Lens Logo"
              />
            )
          }
          onClick={handleSign}
        >
          Sign-In with Lens
        </Button>
      ) : (
        <SwitchNetwork />
      )}
      {/* {( errorAuthenticate || errorProfiles) && (
        <div className="flex items-center space-x-1 font-bold text-red-500">
          X<div>{"ERROR_MESSAGE"}</div>
        </div>
      )} */}
    </div>
  ) : (
    <div className="inline-block overflow-hidden space-y-3 w-full text-left align-middle transition-all transform">
      {connectors.map((connector) => {
        return (
          <Button
            type="button"
            key={connector.id}
            className={clsx(
              {
                " dark:hover:bg-gray-700": connector.id !== activeConnector?.id,
              },
              "w-full flex items-center justify-between space-x-2.5 px-4 py-3 overflow-hidden rounded-xl border dark:border-gray-700/80 outline-none"
            )}
            onClick={() => onConnect(connector)}
            disabled={
              mounted
                ? !connector.ready || connector.id === activeConnector?.id
                : false
            }
          >
            <span>
              {mounted
                ? connector.id === "injected"
                  ? "Browser Wallet"
                  : connector.name
                : connector.name}
              {mounted ? !connector.ready && " (unsupported)" : ""}
            </span>
            {/* <img
              src={getWalletLogo(connector.name)}
              draggable={false}
              className="w-6 h-6"
              height={24}
              width={24}
              alt={connector.id}
            /> */}
          </Button>
        );
      })}
      {error?.message ? (
        <div className="flex items-center space-x-1 text-red-500">
          X<div>{error?.message ?? "Failed to connect"}</div>
        </div>
      ) : null}
    </div>
  );
};

export default WalletSelector;
