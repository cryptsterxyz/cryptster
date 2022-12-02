import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FC } from "react";

import MenuItems from "./MenuItems";

const Navbar: FC = () => {
  interface NavItemProps {
    url: string;
    name: string;
    current: boolean;
  }

  return <MenuItems />;
};

export default Navbar;
