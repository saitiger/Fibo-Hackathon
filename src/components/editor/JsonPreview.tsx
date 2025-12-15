import { useState, useEffect } from "react";
import { PromptState } from "@/types/prompt";
import { useToast } from "@/hooks/use-toast";

interface JsonPreviewProps {
  state: PromptState;
  onStateChange?: (newState: PromptState) => void;
}

export const JsonPreview = ({ state, onStateChange }: JsonPreviewProps) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(state, null, 2));
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setJsonText(JSON.stringify(state, null, 2));
    setIsValid(true);
  }, [state]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);

    try {
      const parsed = JSON.parse(value);
      setIsValid(true);
      onStateChange?.(parsed);
    } catch {
      setIsValid(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Structured Prompt</h3>
        {!isValid && (
          <span className="text-xs text-destructive">Invalid JSON</span>
        )}
      </div>
      <div className={`sketch-box bg-card p-4 overflow-auto max-h-64 ${!isValid ? 'border-destructive' : ''}`}>
        <textarea
          value={jsonText}
          onChange={handleChange}
          className="w-full h-48 font-mono text-sm text-card-foreground bg-transparent resize-none outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
