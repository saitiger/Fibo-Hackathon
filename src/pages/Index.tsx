import { useState } from "react";
import { ControlPanel } from "@/components/editor/ControlPanel";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { HistorySidebar } from "@/components/editor/HistorySidebar";
import { PromptState, defaultPromptState } from "@/types/prompt";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [promptState, setPromptState] = useState<PromptState>(defaultPromptState);
  const [refinement, setRefinement] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [guidanceScale, setGuidanceScale] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedSeed, setGeneratedSeed] = useState<number | null>(null);
  const { toast } = useToast();

  const handlePromptUpdate = (updates: Partial<PromptState> | { camera?: Partial<PromptState['camera']>; lighting?: Partial<PromptState['lighting']> }) => {
    setPromptState((prev) => {
      const newState = { ...prev };
      
      if ('camera' in updates && updates.camera) {
        newState.camera = { ...prev.camera, ...updates.camera };
      }
      if ('lighting' in updates && updates.lighting) {
        newState.lighting = { ...prev.lighting, ...updates.lighting };
      }
      if ('style_medium' in updates) {
        newState.style_medium = updates.style_medium as string;
      }
      if ('short_description' in updates) {
        newState.short_description = updates.short_description as string;
      }
      if ('objects' in updates) {
        newState.objects = updates.objects as string[];
      }
      
      return newState;
    });
  };

  const saveToHistory = async (imageUrl: string, seed: number | null) => {
    await supabase.from('generated_images').insert([{
      image_url: imageUrl,
      prompt_json: JSON.parse(JSON.stringify(promptState)),
      refinement: refinement.trim() || null,
      negative_prompt: negativePrompt.trim() || null,
      guidance_scale: guidanceScale,
      seed: seed
    }]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          promptState, 
          refinement: refinement.trim() || undefined,
          guidanceScale,
          negativePrompt: negativePrompt.trim() || undefined
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate image",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Generation Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedSeed(data.seed);
        setRefinement("");
        
        // Save to history
        await saveToHistory(data.imageUrl, data.seed);
        
        toast({
          title: "Image Generated!",
          description: "Your image has been created from scratch",
        });
      }
    } catch (err) {
      console.error('Generation error:', err);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpdate = async () => {
    if (!generatedImageUrl) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          promptState, 
          refinement: refinement.trim() || undefined,
          referenceImageUrl: generatedImageUrl,
          seed: generatedSeed,
          guidanceScale,
          negativePrompt: negativePrompt.trim() || undefined
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update image",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Update Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedSeed(data.seed);
        setRefinement("");
        
        // Save to history
        await saveToHistory(data.imageUrl, data.seed);
        
        toast({
          title: "Image Updated!",
          description: "Your image has been modified based on the changes",
        });
      }
    } catch (err) {
      console.error('Update error:', err);
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pr-52">
      <HistorySidebar />
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Playground</h1>
          <p className="text-muted-foreground">Structured prompt-based image generation</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="sketch-box bg-card p-6 animate-fade-in hover-scale">
            <ControlPanel state={promptState} onUpdate={handlePromptUpdate} onStateChange={setPromptState} />
          </div>

          <div className="sketch-box bg-card p-6 animate-fade-in-delay hover-scale">
            <PreviewPanel
              onGenerate={handleGenerate}
              onUpdate={handleImageUpdate}
              onBack={() => {
                setGeneratedImageUrl(null);
                setGeneratedSeed(null);
                setRefinement("");
                setNegativePrompt("");
                setGuidanceScale(5);
              }}
              refinement={refinement}
              onRefinementChange={setRefinement}
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              guidanceScale={guidanceScale}
              onGuidanceScaleChange={setGuidanceScale}
              isLoading={isGenerating}
              generatedImageUrl={generatedImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
