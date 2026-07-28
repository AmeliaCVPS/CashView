import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  glowOnHover?: boolean;
}

export const Card = ({ children, className = "", onClick, animated = true, glowOnHover = false }: CardProps) => {
  if (!animated) {
    return (
      <div className={`card p-6 ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div 
      className={`card p-6 relative overflow-hidden ${className}`} 
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      transition={{ duration: 0.3 }}
    >
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = "" }: CardProps) => {
  return (
    <motion.div 
      className={`mb-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export const CardTitle = ({ children, className = "" }: CardProps) => {
  return (
    <motion.h3 
      className={`text-xl font-semibold ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.h3>
  );
};

export const CardContent = ({ children, className = "" }: CardProps) => {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
};