import type { ComponentProps, FC } from "react";
import { customTwMerge } from "../../utils/customTwMerge";

const Button: FC<ComponentProps<"button">> = ({ className, ...restProps }) => (
  <button
    {...restProps}
    className={customTwMerge(
      "text-xl border border-white rounded-lg px-4 py-2 bg-transparent active:bg-white/15",
      {
        "brightness-50": restProps.disabled,
        "hover:bg-white/5 cursor-pointer": !restProps.disabled,
      },
      className
    )}
  />
);

export default Button;
