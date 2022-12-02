import clsx from "clsx";

const Card = ({
  children,
  className,
}: {
  className?: string;
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <div
      className={clsx("card border-theme  shadow-lg shadow-slate-900/5", className)}
    >
      <div className="card-body p-2 sm:p-8">{children}</div>
    </div>
  );
};

export default Card;
