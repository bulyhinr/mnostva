import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    fallbackSrc?: string;
    className?: string;
    onClick?: () => void;
    [key: string]: any;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    fallbackSrc = DEFAULT_FALLBACK,
    className,
    onClick,
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        // Prevent infinite loop if fallback also fails
        if (hasError) return;

        setHasError(true);
        setImgSrc(fallbackSrc);
        if (props.onError) {
            props.onError(e);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onClick={onClick}
            onError={handleError}
            {...props}
        />
    );
};

export default ImageWithFallback;
