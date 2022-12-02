import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { Form, useZodForm } from "../Form";
import Input from "@components/Input";
import Button from "@components/Button";
import { useAppStore } from "@store/app";
import { Dispatch, SetStateAction } from "react";

import toast from "react-hot-toast";
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
    toast.success("Profile updated successfully!");
    onComplete(1);
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
      cover_picture: null,

      // cover_picture: cover ? cover : null,
      attributes: [
        { traitType: "string", key: "app_name", value: "cryptster" },
        { traitType: "string", key: "cryptster_basic_details", value: "true" },
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

  return (
    <Form
      form={form}
      className="w-full items-center flex flex-col"
      onSubmit={({ name, bio }) => {
        // console.log("dsdfsdf");
        editProfile(name, bio);
      }}
    >
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
      <Input label="Bio" placeholder="Bio" {...form.register("bio")} />
      {/* <Input
        label="Website or social link"
        placeholder="Website or social link"
        {...form.register("")}
      /> */}
      <div className="m-auto pt-3">
        <Button
          type="submit"
          variant="primary"
          className="mx-auto mt-3 max-w-xs"
        >
          continue
        </Button>
        {txHash ? <IndexStatus txHash={txHash} /> : null}
      </div>
    </Form>
  );
};

export default BasicDetails;
