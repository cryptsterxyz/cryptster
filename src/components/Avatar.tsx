/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import { forwardRef } from "react";

interface AvatarProps {
  size?: number;
  src: string;
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(function Avatar(
  props: AvatarProps,
  ref
) {
  const { size, ...rest } = props;
  return (
    <div className="avatar">
      <div className={clsx(`w-24 h-24`, "rounded")}>
        <img {...rest} ref={ref} />
      </div>
    </div>
  );
});
