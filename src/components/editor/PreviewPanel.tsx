import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { ImagePreview } from "./ImagePreview";
import { Slider } from "@/components/ui/slider";

interface PreviewPanelProps {
  onGenerate: () => void;
  onUpdate: () => void;
  onBack: () => void;
  refinement: string;
  onRefinementChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  guidanceScale: number;
  onGuidanceScaleChange: (value: number) => void;
  isLoading?: boolean;
  generatedImageUrl?: string | null;
}

export const PreviewPanel = ({ 
  onGenerate,
  onUpdate,
  onBack,
  refinement, 
  onRefinementChange,
  negativePrompt,
  onNegativePromptChange,
  guidanceScale,
  onGuidanceScaleChange,
  isLoading = false,
  generatedImageUrl 
}: PreviewPanelProps) => {
  const hasImage = !!generatedImageUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          disabled={!hasImage}
          className="sketch-button bg-card text-card-foreground px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold text-foreground">Result</h2>
      </div>

      <ImagePreview isLoading={isLoading} generatedImageUrl={generatedImageUrl} />

      <div className="sketch-box bg-card">
        <input
          type="text"
          placeholder={hasImage ? "describe changes to make..." : "add details to your prompt..."}
          value={refinement}
          onChange={(e) => onRefinementChange(e.target.value)}
          className="w-full px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-sketch"
        />
      </div>

      {hasImage && (
        <div className="sketch-box bg-card">
          <input
            type="text"
            placeholder="preserve: e.g. don't change the face, keep background..."
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            className="w-full px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-sketch text-sm"
          />
        </div>
      )}

      {hasImage && (
        <div className="sketch-box bg-card px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-sketch text-muted-foreground">Creativity</span>
            <span className="text-sm font-mono text-foreground">{guidanceScale}</span>
          </div>
          <Slider
            value={[guidanceScale]}
            onValueChange={(values) => onGuidanceScaleChange(values[0])}
            min={3}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>subtle</span>
            <span>creative</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="flex-1 sketch-button bg-primary text-primary-foreground py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {isLoading ? "Generating..." : "Generate"}
        </button>
        
        <button
          onClick={onUpdate}
          disabled={isLoading || !hasImage}
          className="flex-1 sketch-button bg-secondary text-secondary-foreground py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Update
        </button>
      </div>

    </div>
  );
};
