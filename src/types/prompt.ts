export interface PromptState {
  short_description: string;
  objects: string[];
  camera: {
    angle: string;
    view: string;
  };
  lighting: {
    type: string;
    direction: string;
  };
  style_medium: string;
}

export const defaultPromptState: PromptState = {
  short_description: "A model posing in a studio",
  objects: ["woman", "dress"],
  camera: {
    angle: "eye_level",
    view: "medium_shot"
  },
  lighting: {
    type: "studio_lighting",
    direction: "front"
  },
  style_medium: "photograph"
};
