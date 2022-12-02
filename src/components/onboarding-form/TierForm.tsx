import Button from "@components/Button";
import Card from "@components/Card";
import { Form, useZodForm } from "@components/Form";
import TierCard from "@components/TierCard";
import { Input } from "@components/Input";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { object, number, string, array } from "zod";
import { PlusCircleIcon, XIcon } from "@heroicons/react/outline";
import AppearAnimation from "@components/AnimatedAppear";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import StepWizard from "@components/StepWizard";
import clsx from "clsx";
import { useAppStore } from "@store/app";
import uploadToArweave from "@utils/uploadToArweave";
import {
  CreatePublicPostRequest,
  PublicationMainFocus,
  useCreatePostTypedDataMutation,
  useCreatePostViaDispatcherMutation,
  ReferenceModules,
} from "../../../generated";
import toast from "react-hot-toast";
import { RELAY_ON, SIGN_WALLET, TESTNET_LENSHUB_PROXY } from "@utils/constants";
import { usePublicationStore } from "@store/publication";
import trimify from "@utils/trimify";
import { useCollectModuleStore } from "@store/collect-module";
import getSignature from "@utils/getSignature";
import splitSignature from "@utils/splitSignature";
import useBroadcast from "@utils/hooks/useBroadcast";
import { useContractWrite, useSignTypedData } from "wagmi";
import { LensHubProxy } from "@abis/LensHubProxy";
import onError from "@utils/onError";
import { useTransactionPersistStore } from "@store/transaction";
import { useReferenceModuleStore } from "@store/reference-module";

export type tier = { amount: number; comment: string; emoji: string };

const Tier = ({
  index,
  field,
  fieldsData,
  onClick,
  activeTier,
}: {
  index: number;
  field: tier;
  fieldsData: Array<tier>;
  activeTier: number;
  onClick: (field: tier) => void;
}) => {
  const form = useZodForm({
    schema: object({
      amount: number().lt(100),
      comment: string(),
      emoji: string(),
    }),
    defaultValues: field,
  });

  const {
    control,
    formState: { errors },
  } = form;
  const [comment, amount, emoji] = form.watch(["comment", "amount", "emoji"]);
  console.log(errors, "submit");

  const [fields, setFields] = useState(fieldsData);

  useEffect(() => {
    const newTiersData = [
      // Items before the insertion point:
      ...fieldsData.slice(0, activeTier),
      // New item:
      { comment, amount, emoji },
      // Items after the insertion point:
      ...fieldsData.slice(activeTier + 1),
    ];
    setFields(newTiersData);
  }, [comment, amount, emoji]);

  return (
    <div className="flex justify-between">
      <div className="w-1/2">
        <Form
          form={form}
          onSubmit={(formData) => {
            onClick(formData);
          }}
          className="w-full items-center justify-between"
        >
          <AppearAnimation className="flex-grow rounded-2xl  ring-1 ring-slate-900/5">
            <Card className="p-3 pt-6">
              <Input
                type="number"
                label="Balance"
                placeholder="5 MATIC"
                {...form.register(`amount`, {
                  valueAsNumber: true,
                  required: true,
                })}
              />
              <Input
                type="text"
                label="Comment"
                placeholder="Thanks for supporting with 5 MATIC"
                {...form.register(`comment`)}
              />
              <Input
                type="text"
                label="Emoji"
                placeholder="💰"
                {...form.register(`emoji`)}
              />
              <Button
                type="submit"
                variant="primary"
                className="mx-auto mt-3 max-w-xs"
              >
                add more
              </Button>
            </Card>
          </AppearAnimation>
        </Form>
      </div>
      <TierCard activeTier={activeTier} tiers={fields} handle="strek.lens" />
    </div>
  );
};

const TierForm = ({
  onComplete,
}: {
  onComplete: Dispatch<SetStateAction<number>>;
}) => {
  const [activeTier, setActiveTier] = useState(0);

  const [fields, setFields] = useState([
    {
      amount: 1,
      comment: "",
      emoji: "💰",
    },
    {
      amount: 2,
      comment: "",
      emoji: "💰",
    },
    {
      amount: 5,
      comment: "",
      emoji: "💰",
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError,
  });

  // App store
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);

  // Publication store
  const publicationContent = usePublicationStore(
    (state) => state.publicationContent
  );
  const setPublicationContent = usePublicationStore(
    (state) => state.setPublicationContent
  );
  const audioPublication = usePublicationStore(
    (state) => state.audioPublication
  );
  const setShowNewPostModal = usePublicationStore(
    (state) => state.setShowNewPostModal
  );
  // Collect module store
  const resetCollectSettings = useCollectModuleStore((state) => state.reset);
  const payload = useCollectModuleStore((state) => state.payload);

  // Transaction persist store
  const txnQueue = useTransactionPersistStore((state) => state.txnQueue);
  const setTxnQueue = useTransactionPersistStore((state) => state.setTxnQueue);

  const onCompleted = () => {
    setActiveTier((currentTier) => currentTier + 1);
    setPublicationContent("");
    resetCollectSettings();
  };

  const generateOptimisticPost = ({
    txHash,
    txId,
  }: {
    txHash?: string;
    txId?: string;
  }) => {
    return {
      // move it to uuid()
      id: Math.random(),
      type: "NEW_POST",
      txHash,
      txId,
      content: publicationContent,
      // attachments,
      title: audioPublication.title,
      cover: audioPublication.cover,
      author: audioPublication.author,
    };
  };

  const {
    error,
    isLoading: writeLoading,
    write,
  } = useContractWrite({
    address: TESTNET_LENSHUB_PROXY,
    abi: LensHubProxy,
    functionName: "postWithSig",
    mode: "recklesslyUnprepared",
    onSuccess: ({ hash }) => {
      onCompleted();
      setTxnQueue([generateOptimisticPost({ txHash: hash }), ...txnQueue]);
    },
    onError,
  });

  const { broadcast, loading: broadcastLoading } = useBroadcast({
    onCompleted: (data) => {
      onCompleted();
      setTxnQueue([
        generateOptimisticPost({ txId: data?.broadcast?.txId }),
        ...txnQueue,
      ]);
    },
  });
  const [createPostTypedData, { loading: typedDataLoading }] =
    useCreatePostTypedDataMutation({
      onCompleted: async ({ createPostTypedData }) => {
        try {
          const { id, typedData } = createPostTypedData;
          const {
            profileId,
            contentURI,
            collectModule,
            collectModuleInitData,
            referenceModule,
            referenceModuleInitData,
            deadline,
          } = typedData.value;
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { v, r, s } = splitSignature(signature);
          const sig = { v, r, s, deadline };
          const inputStruct = {
            profileId,
            contentURI,
            collectModule,
            collectModuleInitData,
            referenceModule,
            referenceModuleInitData,
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

  const [createPostViaDispatcher, { loading: dispatcherLoading }] =
    useCreatePostViaDispatcherMutation({
      onCompleted: (data) => {
        onCompleted();
        if (data.createPostViaDispatcher.__typename === "RelayerResult") {
          setTxnQueue([
            generateOptimisticPost({
              txId: data.createPostViaDispatcher.txId,
            }),
            ...txnQueue,
          ]);
        }
      },
      onError,
    });

  const createViaDispatcher = async (request: CreatePublicPostRequest) => {
    const { data } = await createPostViaDispatcher({
      variables: { request },
    });
    if (data?.createPostViaDispatcher?.__typename === "RelayError") {
      createPostTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request,
        },
      });
    }
  };
  setPublicationContent(`gift ${currentProfile?.handle} a crypto`);

  const createPost = async ({
    emoji,
    comment,
    amount,
  }: {
    emoji: string;
    comment: string;
    amount: number;
  }) => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    if (publicationContent.length === 0) {
      return console.log("posttt", "Post should not be empty!");
    }

    setIsUploading(true);
    const attributes = [
      {
        traitType: "type",
        displayType: "string",
        value: PublicationMainFocus?.TextOnly?.toLowerCase(),
      },
      {
        traitType: "emoji",
        displayType: "string",
        value: emoji,
      },
      {
        traitType: "comment",
        displayType: "string",
        value: comment,
      },
      {
        traitType: "amount",
        displayType: "string",
        value: amount,
      },
      {
        traitType: "steps",
        displayType: "string",
        value: activeTier,
      },
    ];

    const id = await uploadToArweave({
      version: "2.0.0",
      metadata_id: Math.random(),
      description: trimify(publicationContent),
      content: trimify(publicationContent),
      external_url: `https://cryptster.xyz/u/${currentProfile?.handle}`,
      image: null,
      imageMimeType: null,
      name: `Post by @${currentProfile?.handle}`,
      tags: [],
      animation_url: null,
      mainContentFocus: PublicationMainFocus?.TextOnly,
      contentWarning: null, // TODO
      attributes,
      media: [],
      locale: "en-Us",
      createdOn: new Date(),
      appId: "cryptster",
    }).finally(() => setIsUploading(false));

    const request = {
      profileId: currentProfile?.id,
      contentURI: `https://arweave.net/${id}`,
      collectModule: payload,
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };

    if (currentProfile?.dispatcher?.canUseRelay) {
      createViaDispatcher(request);
    } else {
      console.log("userSigNonce", userSigNonce);
      createPostTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
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

  return (
    <div className="w-full">
      {/* <PlusCircleIcon
        className="h-10 w-10 absolute top-0 right-0 cursor-pointer"
        onClick={() => {
          setTiers((prevState) => prevState + 1);
        }}
      /> */}
      <StepWizard
        className=""
        stages={fields.map((field, index) => (
          <Tier
            activeTier={activeTier}
            key={`tier-${index}`}
            index={index}
            fieldsData={fields}
            field={field}
            onClick={createPost}
          />
        ))}
        activeIndex={activeTier}
      />
    </div>
  );
};

export default TierForm;
