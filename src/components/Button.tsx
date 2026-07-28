import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

// Os handlers de drag/animation do React colidem com os do framer-motion,
// que usam os mesmos nomes com assinaturas diferentes.
type MotionConflictingProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictingProps> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  animated?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  className = "",
  disabled,
  animated = true,
  ...props
}: ButtonProps) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20",
    ghost: "bg-transparent border-2 border-border hover:bg-muted text-foreground",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-lg shadow-danger/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${className}
  `;

  if (!animated || disabled || loading) {
    return (
      <button className={buttonClasses} disabled={disabled || loading} {...props}>
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
        initial={false}
        whileHover={{
          translateX: "200%",
          transition: {
            duration: 0.6,
            ease: "easeInOut"
          }
        }}
      />
      
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{
          scale: 2,
          opacity: [0, 0.5, 0],
          transition: { duration: 0.5 }
        }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {icon && !loading && (
          <motion.span
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          >
            {icon}
          </motion.span>
        )}
        {children}
      </span>
    </motion.button>
  );
};