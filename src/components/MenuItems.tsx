import Link from "next/link";
import { useRouter } from "next/router";
import OnBoard from "pages/onboard";
import { FC, useEffect } from "react";
import { useAppStore } from "../store/app";

import LoginButton from "./shared/LoginButton";

export const NextLink = ({ href, children, ...rest }: Record<string, any>) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);

const MenuItems: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const router = useRouter();
  useEffect(() => {
    // if (currentProfile?.handle) router.push("/onboard");
  }, [currentProfile?.handle]);

  if (!currentProfile) {
    return <LoginButton />;
  }
  return null;
};

export default MenuItems;
