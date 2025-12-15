import { cn } from "@/lib/utils";

interface SketchButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SketchButton = ({ children, active, onClick, className }: SketchButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "sketch-button bg-card text-card-foreground",
        active && "sketch-button-active",
        className
      )}
    >
      {children}
    </button>
  );
};
