import { SketchButton } from "./SketchButton";

interface ControlOption {
  label: string;
  value: string;
}

interface ControlSectionProps {
  title: string;
  options: ControlOption[];
  activeValue: string;
  onSelect: (value: string) => void;
}

export const ControlSection = ({ title, options, activeValue, onSelect }: ControlSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <SketchButton
            key={option.value}
            active={activeValue === option.value}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </SketchButton>
        ))}
      </div>
    </div>
  );
};
