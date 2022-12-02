import MenuItems from "@components/MenuItems";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => (
  <div className="navbar bg-slate-900 text-white">
    <div className="navbar-start"></div>
    <div className="navbar-center">
      <a className="btn btn-ghost normal-case text-xl">Cryptster</a>
    </div>
    <MenuItems />
    <div className="navbar-end">
      <ThemeToggle />
    </div>
  </div>
);

export default NavBar;
