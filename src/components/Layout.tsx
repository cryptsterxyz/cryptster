import getIsAuthTokensAvailable from "../utils/getIsAuthTokensAvailable";
// import getToastOptions from "@lib/getToastOptions";
import resetAuthData from "../utils/resetAuthData";
import type { Profile } from "../../generated";
import { useUserProfilesQuery } from "../../generated";
import Head from "next/head";
// import { useTheme } from "next-themes";
import type { FC, ReactNode } from "react";
import { useEffect } from "react";
import { CHAIN_ID } from "../utils/constants";
import { useAppPersistStore, useAppStore } from "../store/app";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import useIsMounted from "../utils/hooks/useIsMounted";
import Navbar from "@components/NavBar";

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const setProfiles = useAppStore((state) => state.setProfiles);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const profileId = useAppPersistStore((state) => state.profileId);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);

  const { mounted } = useIsMounted();
  const { address, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const resetAuthState = () => {
    setProfileId(null);
    setCurrentProfile(null);
  };

  // Fetch current profiles and sig nonce owned by the wallet address
  const { loading } = useUserProfilesQuery({
    variables: { ownedBy: address },
    skip: !profileId,
    onCompleted: (data) => {
      const profiles = data?.profiles?.items
        ?.slice()
        ?.sort((a, b) => Number(a.id) - Number(b.id))
        ?.sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );

      if (!profiles.length) {
        return resetAuthState();
      }

      const selectedUser = profiles.find((profile) => profile.id === profileId);
      const totalFollowing = selectedUser?.stats?.totalFollowing || 0;
      setProfiles(profiles as Profile[]);
      setCurrentProfile(selectedUser as Profile);
      setProfileId(selectedUser?.id);

      setUserSigNonce(data?.userSigNonces?.lensHubOnChainSigNonce);
    },
  });

  const validateAuthentication = () => {
    const currentProfileAddress = currentProfile?.ownedBy;
    const isSwitchedAccount =
      currentProfileAddress !== undefined && currentProfileAddress !== address;
    const isWrongNetworkChain = chain?.id !== CHAIN_ID;
    const shouldLogout =
      !getIsAuthTokensAvailable() ||
      isWrongNetworkChain ||
      isDisconnected ||
      isSwitchedAccount;

    // If there are no auth data, clear and logout
    if (shouldLogout && profileId) {
      resetAuthState();
      resetAuthData();
      disconnect?.();
    }
  };

  useEffect(() => {
    validateAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisconnected, address, chain, disconnect, profileId]);

  if (loading || !mounted) {
    return <p>loading n not mounted</p>;
  }

  return (
    <>
      <Head>
        <meta name="theme-color" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {children}
      </div>
    </>
  );
};

export default Layout;
