import { useState } from "react";

interface ImagePreviewProps {
  isLoading?: boolean;
  generatedImageUrl?: string | null;
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",
];

export const ImagePreview = ({ isLoading, generatedImageUrl }: ImagePreviewProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  const cycleImage = () => {
    if (!generatedImageUrl) {
      setCurrentImage((prev) => (prev + 1) % placeholderImages.length);
    }
  };

  const displayImage = generatedImageUrl || placeholderImages[currentImage];

  return (
    <div className="sketch-box bg-card overflow-hidden">
      {isLoading ? (
        <div className="w-full aspect-[3/4] min-h-[400px] flex items-center justify-center bg-muted">
          <div className="text-muted-foreground text-lg animate-pulse">
            Generating...
          </div>
        </div>
      ) : (
        <img
          src={displayImage}
          alt="Generated preview"
          className="w-full aspect-[3/4] min-h-[400px] object-contain cursor-pointer bg-muted/30"
          onClick={cycleImage}
        />
      )}
    </div>
  );
};

export { placeholderImages };
