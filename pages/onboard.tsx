import AppearAnimation from "@components/AnimatedAppear";
import { Avatar } from "@components/Avatar";
import Button from "@components/Button";
import Card from "@components/Card";
import Editor from "@components/Editor";
import withEditorContext from "@components/Editor/withLexicalContext";
import NavBar from "@components/NavBar";
import BasicDetails from "@components/onboarding-form/BasicDetails";
import TierForm from "@components/onboarding-form/TierForm";
import { useAppStore } from "@store/app";
import { splitSignature } from "ethers/lib/utils.js";
import useBroadcast from "@utils/hooks/useBroadcast";
import { useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import withAuthenticatedRoute from "src/utils/withAuthenticatedRoute";
import type {
  CreatePublicSetProfileMetadataUriRequest,
  MediaSet,
} from "generated";
import { LENS_PERIPHERY, RELAY_ON, SIGN_WALLET } from "@utils/constants";
import { useContractWrite, useSignTypedData } from "wagmi";
import onError from "@utils/onError";
import { LensPeriphery } from "@abis/LensPeriphery";
import {
  useCreateSetProfileMetadataTypedDataMutation,
  useCreateSetProfileMetadataViaDispatcherMutation,
} from "generated";
import getSignature from "@utils/getSignature";
import uploadToArweave from "@utils/uploadToArweave";

function OnBoard() {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const [isUploading, setIsUploading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onCompleted = () => {
    toast.success("Profile updated successfully!");
  };

  const {
    broadcast,
    data: broadcastData,
    loading: broadcastLoading,
  } = useBroadcast({ onCompleted });

  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError,
  });

  const {
    data: writeData,
    isLoading: writeLoading,
    error,
    write,
  } = useContractWrite({
    address: LENS_PERIPHERY,
    abi: LensPeriphery,
    functionName: "setProfileMetadataURIWithSig",
    mode: "recklesslyUnprepared",
    onSuccess: onCompleted,
    onError,
  });

  const [createSetProfileMetadataTypedData, { loading: typedDataLoading }] =
    useCreateSetProfileMetadataTypedDataMutation({
      onCompleted: async ({ createSetProfileMetadataTypedData }) => {
        try {
          const { id, typedData } = createSetProfileMetadataTypedData;
          const { profileId, metadata, deadline } = typedData.value;
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { v, r, s } = splitSignature(signature);
          const sig = { v, r, s, deadline };
          console.log("currentProfile", currentProfile);
          const inputStruct = {
            user: currentProfile?.ownedBy,
            profileId,
            metadata,
            sig,
          };
          // setUserSigNonce(userSigNonce + 1);
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

  const [
    createSetProfileMetadataViaDispatcher,
    { data: dispatcherData, loading: dispatcherLoading },
  ] = useCreateSetProfileMetadataViaDispatcherMutation({
    onCompleted,
    onError,
  });

  const createViaDispatcher = async (
    request: CreatePublicSetProfileMetadataUriRequest
  ) => {
    const { data } = await createSetProfileMetadataViaDispatcher({
      variables: { request },
    });
    if (
      data?.createSetProfileMetadataViaDispatcher?.__typename === "RelayError"
    ) {
      createSetProfileMetadataTypedData({
        variables: {
          // options: { overrideSigNonce: userSigNonce },
          request,
        },
      });
    }
  };
  console.log(currentProfile, "check");
  const editProfile = async (aboutContent) => {
    // check why editing doesnt update attributes
    debugger;
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }
    console.log(currentProfile);

    setIsUploading(true);
    const id = await uploadToArweave({
      ...currentProfile,
      attributes: [
        ...currentProfile.attributes,
        { traitType: "string", key: "about_content", value: aboutContent },
      ],
      version: "1.0.0",
      metadata_id: Math.random(),
      createdOn: new Date(),
      appId: "cryptster",
    }).finally(() => {
      setIsUploading(false);
    });

    const request = {
      profileId: currentProfile?.id,
      metadata: `https://arweave.net/${id}`,
    };
    console.log("dg", currentProfile);
    if (currentProfile?.dispatcher?.canUseRelay) {
      createViaDispatcher(request);
    } else {
      createSetProfileMetadataTypedData({
        variables: {
          request,
        },
      });
    }
  };

  const isLoading =
    isUploading ||
    typedDataLoading ||
    dispatcherLoading ||
    signLoading ||
    writeLoading ||
    broadcastLoading;
  const txHash =
    writeData?.hash ??
    broadcastData?.broadcast?.txHash ??
    (dispatcherData?.createSetProfileMetadataViaDispatcher.__typename ===
      "RelayerResult" &&
      dispatcherData?.createSetProfileMetadataViaDispatcher.txHash);

  const [aboutContent, setAboutContent] = useState("");
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
              <Editor
                viewOnly
                className=" lexical-about h-[500px]"
                onChange={(e) => setAboutContent(e)}
              />
              <Button
                onClick={() => {
                  editProfile(aboutContent);
                  setSteps(2);
                }}
                disabled={isLoading}
                type="submit"
                variant="primary"
                className="mx-auto mt-3 max-w-xs"
              >
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4" />}
                continue
              </Button>
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
