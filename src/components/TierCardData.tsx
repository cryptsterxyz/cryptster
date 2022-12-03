import { useProfileTierStore } from "@store/profile-tiers";
import TierCard from "./TierCard";
import {
  PublicationMainFocus,
  PublicationTypes,
  useProfileFeedQuery,
} from "generated";
import type { Profile } from "generated";

import { useAppStore } from "@store/app";
import { Dispatch, FC, SetStateAction } from "react";
import getAttributeFromTrait from "@utils/getAttributeFromTrait";

interface Props {
  profile: Profile;
  type: "NEW_POST" | "REPLIES" | "MEDIA";
  party?: boolean;
  setParty?: Dispatch<SetStateAction<boolean>>;
}
const TierCardData: FC<Props> = ({
  profile,
  type = "NEW_POST",
  setParty,
  party = false,
}) => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  const mediaFeedFilters = useProfileTierStore(
    (state) => state.mediaTierFilters
  );

  const getMediaFilters = () => {
    let filters: PublicationMainFocus[] = [];
    if (mediaFeedFilters.images) {
      filters.push(PublicationMainFocus.Image);
    }
    if (mediaFeedFilters.video) {
      filters.push(PublicationMainFocus.Video);
    }
    if (mediaFeedFilters.audio) {
      filters.push(PublicationMainFocus.Audio);
    }
    return filters;
  };

  const publicationTypes =
    type === "NEW_POST"
      ? [PublicationTypes.Post, PublicationTypes.Mirror]
      : type === "MEDIA"
      ? [PublicationTypes.Post, PublicationTypes.Comment]
      : [PublicationTypes.Comment];
  const metadata =
    type === "MEDIA"
      ? {
          mainContentFocus: getMediaFilters(),
        }
      : null;

  const request = {
    publicationTypes,
    metadata,
    profileId: profile?.id,
    limit: 10,
  };
  const reactionRequest = currentProfile
    ? { profileId: currentProfile?.id }
    : null;
  const profileId = currentProfile?.id ?? null;

  const { data, loading, error, fetchMore } = useProfileFeedQuery({
    variables: { request, reactionRequest, profileId },
    skip: false,
  });

  const Tierattributes = data?.publications.items;

  const tiers = Tierattributes?.map((tier) => ({
    ...tier.metadata.attributes.reduce(
      (acc, { traitType, value }) => ({
        ...acc,
        [traitType]: value,
      }),
      {}
    ),
  }));
  return tiers?.length ? (
    <TierCard
      handle="strek.lens"
      tiers={tiers || []}
      publications={data?.publications.items}
      setParty={setParty}
      party={party}
      viewOnly={false}
    />
  ) : (
    <div
      className="card border-theme  shadow-lg shadow-slate-900/5 z-10 py-5 w-full lg:w-2/5 tier-card
        card shadow-lg shadow-slate-900/5 ring-slate-900/500 flex flex-col justify-center items-center
         border border-theme"
    >
      <div className="card-body p-2 sm:p-8 w-full">
        <h2 className="h-auto font-bold text-xl flex-grow-0 sm:text-2xl text-center bg-gray-800 animate-pulse">
          <p className="opacity-0"> loading</p>
        </h2>
        <p className="h-auto min-h-12 py-2 flex-grow-0"></p>
        <div className="card animate-pulse border-theme  shadow-lg shadow-slate-900/5 rounded-md border border-theme w-full flex items-center bg-theme">
          <div className="card-body p-2 sm:p-8 w-full">
            <div className="flex justify-center items-center">
              <div className="text-[50px]">🌸</div>
              <div className="ml-3 text-theme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="w-7 h-7 outline-1 dark:text-white text-theme"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-wrap">
                <button className="bg-theme-darker text-primary-content m-1 sm:m-2 h-10 w-10 rounded-full flex justify-center items-center">
                  <span></span>
                </button>
                <button className="border border-theme bg-white text-gray-800 m-1 sm:m-2 h-10 w-10 rounded-full flex justify-center items-center">
                  <span></span>
                </button>
                <button className="border border-theme bg-white text-gray-800 m-1 sm:m-2 h-10 w-10 rounded-full flex justify-center items-center">
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn bg-primary hover:bg-primary border-1 capitalize w-full button-primary border-theme animate-pulse"></button>
        </div>
      </div>
    </div>
  );
};
export default TierCardData;
