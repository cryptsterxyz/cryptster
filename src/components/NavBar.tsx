import MenuItems from "@components/MenuItems";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => (
  <div className="navbar h-8 bg-slate-900 text-white">
    <div className="navbar-start ml-10">
      <img src="/logo.svg" className="w-8 h-8" />
      <p className="ml-2">Cryptster</p>
    </div>
    <div className="navbar-end">
      <MenuItems />
    </div>
  </div>
);

export default NavBar;
