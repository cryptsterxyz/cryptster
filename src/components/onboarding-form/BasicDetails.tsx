import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { Form, useZodForm } from "../Form";
import Input from "@components/Input";
import Button from "@components/Button";
import { useAppStore } from "@store/app";
import { Dispatch, SetStateAction } from "react";

import toast, { LoaderIcon } from "react-hot-toast";
import { useState } from "react";
import uploadToArweave from "@utils/uploadToArweave";
import onError from "@utils/onError";
import useBroadcast from "@utils/hooks/useBroadcast";
import { LensPeriphery } from "@abis/index";
import { useContractWrite, useSignTypedData } from "wagmi";

import type {
  CreatePublicSetProfileMetadataUriRequest,
  MediaSet,
} from "../../../generated";
import {
  Profile,
  useCreateSetProfileMetadataTypedDataMutation,
  useCreateSetProfileMetadataViaDispatcherMutation,
} from "../../../generated";
import getSignature from "@utils/getSignature";
import { LENS_PERIPHERY, RELAY_ON, SIGN_WALLET } from "@utils/constants";

import { splitSignature } from "ethers/lib/utils.js";
import IndexStatus from "@components/shared/IndexStatus";
import Editor from "@components/Editor";
import withEditorContext from "@components/Editor/withLexicalContext";
import AppearAnimation from "@components/AnimatedAppear";
import { Avatar } from "@components/Avatar";
import Bio from "@components/Bio";
import ProfilePicture from "@components/ProfilePicture";
// const schema = z.object({
//   name: z.string().min(1, { message: "Required" }),
//   age: z.number().min(10),
// });

const newContactSchema = object({
  name: string(),
  handle: string(),
  bio: string(),
});

const BasicDetails = ({
  onComplete,
}: {
  onComplete: Dispatch<SetStateAction<number>>;
}) => {
  const [editorContent, setEditorContent] = useState("");
  const currentProfile = useAppStore((state) => state.currentProfile);
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const [isUploading, setIsUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const form = useZodForm({
    schema: newContactSchema,
    defaultValues: {
      name: currentProfile?.name ?? "",
      handle: `cryptster.xyz/u/${currentProfile?.handle ?? ""}`,
      bio: currentProfile?.bio ?? "",
    },
  });
  const onCompleted = () => {
    onComplete(1);
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

  const editProfile = async (name: string, bio?: string | null) => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    setIsUploading(true);
    const id = await uploadToArweave({
      name,
      bio,
      cover_picture:
        "https://1.bp.blogspot.com/-CbWLumSsnHA/X3NCN8Y97SI/AAAAAAAAbdM/6_nItNbt0jcQvkFzogyKeqUGJjMyM57rACLcBGAsYHQ/s16000/v3-290920-rocket-minimalist-desktop-wallpaper-hd.png",

      // cover_picture: cover ? cover : null,
      attributes: [
        { traitType: "string", key: "app_name", value: "cryptster" },
        { traitType: "string", key: "cryptster_basic_details", value: "true" },
        { traitType: "string", key: "about", value: editorContent },
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

  return (
    <AppearAnimation className="flex flex-col justify-center items-center  flex-wrap sm:flex-nowrap">
      <div className="flex w-full">
        <div className="w-1/2">
          <Form
            form={form}
            className="w-full items-center flex flex-col"
            onSubmit={({ name, bio }) => {
              // console.log("dsdfsdf");
              editProfile(name, bio);
            }}
          >
            <ProfilePicture />
            <Input
              type={""}
              label="Name"
              placeholder="Name"
              {...form.register("name")}
            />
            <Input
              label="Your custom page URL"
              placeholder="cryptster/strek.lens"
              disabled
              {...form.register("handle")}
            />
            <div className="form-control w-full max-w-md mx-auto">
              <label className="label">
                <span className="label-text text-white">short bio</span>
              </label>{" "}
              <Bio
                initialState={form.getValues().bio}
                setEditorContent={setEditorContent}
                form={form}
              />
            </div>
            <div className="m-auto pt-3">
              <Button
                disabled={isLoading}
                type="submit"
                variant="primary"
                className="mx-auto mt-3 max-w-xs"
              >
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4" />}
                continue to add tier details
              </Button>
              {txHash ? <IndexStatus txHash={txHash} /> : null}
            </div>
          </Form>
        </div>

        <div className="w-1/2 ring-1 rounded-md p-8 ml-4">
          <h2 className="text-white">Let people know what you do</h2>
          {console.log()}
          {form.getValues() && (
            <Editor
              initialState={
                currentProfile?.attributes.filter(
                  ({ key }) => key === "about"
                )?.[0]?.value
              }
              viewOnly
              className=" lexical-about h-[500px]"
              onChange={(e) => setEditorContent(e)}
            />
          )}
        </div>
      </div>
    </AppearAnimation>
  );
};

export default BasicDetails;
