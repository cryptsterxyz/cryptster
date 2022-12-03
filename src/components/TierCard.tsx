import { Dispatch, SetStateAction, useState } from "react";
import Button from "@components/Button";
import Card from "./Card";
import clsx from "clsx";
import { XIcon } from "@heroicons/react/outline";
import { tier } from "./onboarding-form/TierForm";
import toast from "react-hot-toast";
import { RELAY_ON, SIGN_WALLET, TESTNET_LENSHUB_PROXY } from "@utils/constants";
import { useAppStore } from "@store/app";
import {
  CollectModules,
  useCollectModuleQuery,
  useCreateCollectTypedDataMutation,
  useProxyActionMutation,
} from "../../generated";
import onError from "@utils/onError";
import useBroadcast from "@utils/hooks/useBroadcast";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useSignTypedData,
} from "wagmi";
import getSignature from "@utils/getSignature";
import { defaultAbiCoder, splitSignature } from "ethers/lib/utils.js";
import { LensHubProxy } from "@abis/LensHubProxy";
import { UpdateOwnableFeeCollectModule } from "@abis/UpdateOwnableFeeCollectModule";
import { BigNumber } from "ethers";
interface TierProps {
  tiers: Array<tier>;
  handle: string;
  activeTier?: number;
  viewOnly?: boolean;
  publications?: any;
  party?: boolean;
  setParty?: any;
}

const handleGift = () => {
  alert("hiiii");
};

const TierCard = ({
  handle,
  activeTier = 0,
  tiers,
  publications,
  setParty,
  party = false,
  viewOnly = true,
}: TierProps) => {
  const [currentTier, setCurrentTier] = useState(activeTier);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const { address } = useAccount();
  const userSigNonce = useAppStore((state) => state.userSigNonce);

  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);

  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError,
  });

  const onCompleted = () => {
    setParty(!party);

    toast.success("Transaction submitted successfully!");
  };

  const {
    data: writeData,
    isLoading: writeLoading,
    write,
  } = useContractWrite({
    address: TESTNET_LENSHUB_PROXY,
    abi: LensHubProxy,
    functionName: "collectWithSig",
    mode: "recklesslyUnprepared",
    onSuccess: onCompleted,
    onError,
  });
  const {
    broadcast,
    data: broadcastData,
    loading: broadcastLoading,
  } = useBroadcast({ onCompleted });
  const { data, loading } = useCollectModuleQuery({
    variables: {
      request: {
        publicationId: publications ? publications[currentTier]?.id : "0",
      },
    },
  });

  const collectModule: any = data?.publication?.collectModule;
  const [createCollectTypedData, { loading: typedDataLoading }] =
    useCreateCollectTypedDataMutation({
      onCompleted: async ({ createCollectTypedData }) => {
        try {
          const { id, typedData } = createCollectTypedData;
          const {
            profileId,
            pubId,
            data: collectData,
            deadline,
          } = typedData.value;
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { v, r, s } = splitSignature(signature);
          const sig = { v, r, s, deadline };
          const inputStruct = {
            collector: address,
            profileId,
            pubId,
            data: collectData,
            sig,
          };

          setUserSigNonce(userSigNonce + 1);
          if (!RELAY_ON) {
            return write?.({ recklesslySetUnpreparedArgs: [inputStruct] });
          }

          const {
            data: { broadcast: result },
          } = await broadcast({ request: { id, signature } });

          if ("reason" in result) {
            write?.({ recklesslySetUnpreparedArgs: [inputStruct] });
          }
        } catch {}
      },
      onError,
    });
  const { isFetching, refetch } = useContractRead({
    address: "0xA78E4a4D0367f0f4674130F0Bb2653957ab5917e",
    abi: UpdateOwnableFeeCollectModule,
    functionName: "getPublicationData",
    args: [
      parseInt(publications ? publications[currentTier]?.id : "0"),
      parseInt(
        publications ? publications[currentTier]?.id.split("-")[1] : "0"
      ),
    ],
    enabled: false,
  });
  const [createCollectProxyAction, { loading: proxyActionLoading }] =
    useProxyActionMutation({
      onCompleted,
      onError,
    });
  const createViaProxyAction = async (variables: any) => {
    const { data } = await createCollectProxyAction({ variables });
    if (!data?.proxyAction) {
      createCollectTypedData({
        variables: {
          request: {
            publicationId: publications ? publications[currentTier]?.id : "0",
          },
          options: { overrideSigNonce: userSigNonce },
        },
      });
    }
  };
  const createCollect = () => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    if (collectModule?.type === CollectModules.FreeCollectModule) {
      createViaProxyAction({
        request: {
          collect: {
            freeCollect: {
              publicationId: publications ? publications[currentTier]?.id : "0",
            },
          },
        },
      });
    } else if (collectModule?.__typename === "UnknownCollectModuleSettings") {
      refetch().then(({ data }) => {
        if (data) {
          const decodedData: any = data;
          const encodedData = defaultAbiCoder.encode(
            ["address", "uint256"],
            [decodedData?.[2] as string, decodedData?.[1] as BigNumber]
          );
          createCollectTypedData({
            variables: {
              options: { overrideSigNonce: userSigNonce },
              request: {
                publicationId: publications
                  ? publications[currentTier]?.id
                  : "0",
                unknownModuleData: encodedData,
              },
            },
          });
        }
      });
    } else {
      createCollectTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            publicationId: publications ? publications[currentTier]?.id : "0",
          },
        },
      });
    }
  };

  return (
    <Card
      className={clsx(
        `m-2 z-10 py-5 my-auto xl:mt-18 w-full lg:w-2/5 tier-card
        card shadow-lg shadow-slate-900/5 ring-slate-900/500 flex flex-col justify-center items-center
        `,
        {
          "bg-slate-900 text-white bg-gray-900/50 ring-1": viewOnly,
          "border border-theme": !viewOnly,
        }
      )}
    >
      <h2 className="h-auto font-bold text-xl flex-grow-0 sm:text-2xl ">
        Gift {handle} some crypto
      </h2>
      <p className="h-auto min-h-12 py-2 flex-grow-0">
        {tiers[currentTier]?.comment}
      </p>
      <Card className="rounded-md border border-theme w-full flex items-center bg-theme">
        <div className="flex justify-center items-center">
          <div className="text-[50px]">{tiers[currentTier]?.emoji}</div>
          <div className="ml-3 text-theme">
            <XIcon className="w-7 h-7 outline-1 dark:text-white text-theme" />
          </div>
          <div className="flex flex-wrap">
            {tiers.map(({ amount, steps }, _index) => (
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
                key={"tier" + _index}
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
          onClick={createCollect}
        >
          Gift {tiers[currentTier]?.amount}
        </Button>
      </div>
    </Card>
  );
};

export default TierCard;
