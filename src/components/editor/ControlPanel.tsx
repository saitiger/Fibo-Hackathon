import { PromptState } from "@/types/prompt";
import { ControlSection } from "./ControlSection";
import { JsonPreview } from "./JsonPreview";

interface ControlPanelProps {
  state: PromptState;
  onUpdate: (updates: Partial<PromptState> | { camera?: Partial<PromptState['camera']>; lighting?: Partial<PromptState['lighting']> }) => void;
  onStateChange?: (newState: PromptState) => void;
}

const cameraAngleOptions = [
  { label: "Wide", value: "wide_angle" },
  { label: "Low", value: "low_angle" },
  { label: "Upper", value: "high_angle" },
  { label: "POV", value: "pov" },
  { label: "Eye Level", value: "eye_level" },
];

const cameraViewOptions = [
  { label: "Close-up", value: "close_up" },
  { label: "Medium", value: "medium_shot" },
  { label: "Full Body", value: "full_body" },
  { label: "Wide", value: "wide_shot" },
];

const styleOptions = [
  { label: "Fashion", value: "fashion_photography" },
  { label: "Cinematic", value: "cinematic" },
  { label: "B&W", value: "black_and_white" },
  { label: "Portrait", value: "portrait" },
  { label: "Editorial", value: "editorial" },
];

const lightingOptions = [
  { label: "Soft", value: "softbox" },
  { label: "Hard", value: "hard_light" },
  { label: "Natural", value: "natural_light" },
  { label: "Neon", value: "neon_lights" },
  { label: "Studio", value: "studio_lighting" },
];

const lightingDirectionOptions = [
  { label: "Front", value: "front" },
  { label: "Side", value: "side" },
  { label: "Back", value: "back" },
  { label: "Rim", value: "rim" },
];

export const ControlPanel = ({ state, onUpdate, onStateChange }: ControlPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">edit your image</h2>
        <p className="text-muted-foreground text-sm">(this is optional page)</p>
      </div>

      <ControlSection
        title="camera angle"
        options={cameraAngleOptions}
        activeValue={state.camera.angle}
        onSelect={(value) => onUpdate({ camera: { ...state.camera, angle: value } })}
      />

      <ControlSection
        title="camera view"
        options={cameraViewOptions}
        activeValue={state.camera.view}
        onSelect={(value) => onUpdate({ camera: { ...state.camera, view: value } })}
      />

      <ControlSection
        title="style"
        options={styleOptions}
        activeValue={state.style_medium}
        onSelect={(value) => onUpdate({ style_medium: value })}
      />

      <ControlSection
        title="lighting type"
        options={lightingOptions}
        activeValue={state.lighting.type}
        onSelect={(value) => onUpdate({ lighting: { ...state.lighting, type: value } })}
      />

      <ControlSection
        title="lighting direction"
        options={lightingDirectionOptions}
        activeValue={state.lighting.direction}
        onSelect={(value) => onUpdate({ lighting: { ...state.lighting, direction: value } })}
      />

      <JsonPreview state={state} onStateChange={onStateChange} />
    </div>
  );
};
