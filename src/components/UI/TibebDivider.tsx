// A subtle SVG divider drawn from Ethiopian Tibeb textile geometry.
export default function TibebDivider({ className = '' }: { className?: string }) {
    return (
        <div className={`flex justify-center items-center my-16 ${className}`} aria-hidden="true">
            <svg width="240" height="20" viewBox="0 0 240 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left line */}
                <line x1="0" y1="10" x2="90" y2="10" stroke="#B87040" strokeWidth="0.75" strokeOpacity="0.5" />
                {/* Central Tibeb pattern: 3 nested diamonds */}
                <polygon points="120,2 128,10 120,18 112,10" stroke="#B87040" strokeWidth="0.75" fill="none" strokeOpacity="0.6" />
                <polygon points="120,5 125,10 120,15 115,10" stroke="#8B1A1A" strokeWidth="0.5" fill="none" strokeOpacity="0.4" />
                <rect x="118.5" y="8.5" width="3" height="3" fill="#C9A84C" opacity="0.7" transform="rotate(45 120 10)" />
                {/* Right line */}
                <line x1="150" y1="10" x2="240" y2="10" stroke="#B87040" strokeWidth="0.75" strokeOpacity="0.5" />
            </svg>
        </div>
    );
}
