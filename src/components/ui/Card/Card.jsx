import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";

const Card = ({
  children,
  className = "",
  padding = "default",
  hover = false,
  animate = true,
  ...props
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-4",
    lg: "p-8",
  };

  const Component = animate ? motion.div : "div";

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component
      {...animationProps}
      className={cn(
        "bg-gray-150 rounded-lg",
        paddings[padding],
        hover && "hover:shadow-sm transition-shadow",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
