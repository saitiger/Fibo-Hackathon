import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedImage {
  id: string;
  image_url: string;
  created_at: string;
}

export const HistorySidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('generated_images_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generated_images'
        },
        (payload) => {
          setImages((prev) => [payload.new as GeneratedImage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    // Use the public view to avoid exposing client_ip
    const { data, error } = await supabase
      .from('generated_images_public')
      .select('id, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setImages(data);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 sketch-button bg-card p-2 z-50 transition-all duration-300"
        style={{ right: isOpen ? '192px' : '0' }}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      
      <div
        className={`fixed right-0 top-0 h-full bg-card border-l-2 border-foreground transition-all duration-300 z-40 w-48 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >

      <div className="p-3 h-full overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-violet-500" />
          {isOpen && <span className="font-bold text-foreground">History</span>}
        </div>

        {isOpen && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
            ) : images.length === 0 ? (
              <div className="text-muted-foreground text-sm">No images yet</div>
            ) : (
              images.map((image, index) => (
                <div
                  key={image.id}
                  className="history-thumb animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/image/${image.id}`)}
                >
                  <img
                    src={image.image_url}
                    alt="Generated"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};