'use client';

interface Video {
  src: string;
  name: string;
  caption?: string;
}

interface VideoSectionProps {
  videos: Video[];
}

export default function VideoSection({ videos }: VideoSectionProps) {
  if (videos.length === 0) return null;

  const isMulti = videos.length > 1;
  const gridCols = videos.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className="space-y-6">
      <p className="caption text-[var(--ochre)] text-center">Fragments vidéo</p>
      <div
        className={`grid gap-6 md:gap-8 ${isMulti ? gridCols : 'max-w-3xl mx-auto'}`}
      >
        {videos.map((video, i) => (
          <figure key={i} className={isMulti ? 'min-w-0' : undefined}>
            <video
              src={video.src}
              controls
              playsInline
              className="w-full rounded-lg border border-[var(--border)] bg-black/5 aspect-video object-contain"
              preload="metadata"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
            {video.caption && (
              <figcaption className="mt-2 text-sm text-[var(--ink-light)] italic font-[family-name:var(--font-lora)]">
                {video.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
