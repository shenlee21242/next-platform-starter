export default function NativeImage({ src, alt = '', fill = false, priority = false, sizes, style, ...props }) {
    const resolvedSrc = typeof src === 'string' ? src : src?.src;
    return (
        <img
            src={resolvedSrc}
            alt={alt}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style } : style}
            {...props}
        />
    );
}
