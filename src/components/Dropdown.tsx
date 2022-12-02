import { ReactElement } from "react";

const Dropdown = ({
  toggle,
  children,
}: {
  toggle: ReactElement;
  children: JSX.Element | JSX.Element[];
}) => {
  const Toggle = toggle;
  return (
    <div title="Change Theme" className="dropdown dropdown-end ">
      <div tabIndex={0} className="btn gap-1 normal-case btn-ghost">
        {toggle}
      </div>
      <div className="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 h-[70vh] w-52 overflow-y-auto shadow-2xl mt-16">
        <div className="grid grid-cols-1 gap-3 p-3" tabIndex={0}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
