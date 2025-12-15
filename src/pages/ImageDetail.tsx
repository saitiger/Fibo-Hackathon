import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageData {
  id: string;
  image_url: string;
  prompt_json: unknown;
  refinement: string | null;
  negative_prompt: string | null;
  guidance_scale: number | null;
  seed: number | null;
  created_at: string;
}

const ImageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchImage = async (imageId: string) => {
    setIsLoading(true);
    // Use the public view to avoid exposing client_ip
    const { data, error } = await supabase
      .from('generated_images_public')
      .select('*')
      .eq('id', imageId)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load image",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (!data) {
      toast({
        title: "Not Found",
        description: "Image not found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setImage(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!id) return;

    void fetchImage(id);
    // We intentionally only depend on `id` here to avoid re-running
    // when `fetchImage` is re-created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyJson = () => {
    if (image) {
      navigator.clipboard.writeText(JSON.stringify(image.prompt_json, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!image) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="sketch-button bg-card text-card-foreground px-4 py-2 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playground
          </button>
          <h1 className="text-3xl font-bold text-foreground">Image Details</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generated on {new Date(image.created_at).toLocaleString()}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="sketch-box bg-card p-4 animate-fade-in hover-scale">
            <img
              src={image.image_url}
              alt="Generated image"
              className="w-full rounded-lg"
            />
            {image.seed && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Seed: {image.seed}
              </p>
            )}
          </div>

          <div className="space-y-4 animate-fade-in-delay">
            <div className="sketch-box bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-foreground">Prompt JSON</h2>
                <button
                  onClick={copyJson}
                  className="sketch-button bg-secondary text-secondary-foreground px-3 py-1 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground max-h-96 overflow-y-auto">
                {JSON.stringify(image.prompt_json, null, 2)}
              </pre>
            </div>

            {image.refinement && (
              <div className="sketch-box bg-card p-4">
                <h3 className="font-bold text-foreground mb-2">Refinement</h3>
                <p className="text-foreground">{image.refinement}</p>
              </div>
            )}

            {image.negative_prompt && (
              <div className="sketch-box bg-card p-4">
                <h3 className="font-bold text-foreground mb-2">Preserve / Negative</h3>
                <p className="text-foreground">{image.negative_prompt}</p>
              </div>
            )}

            {image.guidance_scale && (
              <div className="sketch-box bg-card p-4">
                <h3 className="font-bold text-foreground mb-2">Creativity Level</h3>
                <p className="text-foreground font-mono">{image.guidance_scale}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;