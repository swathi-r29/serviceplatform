import { useEffect, useRef, useState } from 'react';
import './ScrollAnimationHero.css';

const ScrollAnimationHero = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const frameCache = useRef({});
  const totalFrames = 240;
  const [scrollProgress, setScrollProgress] = useState(0);

  // 🚀 Override default Vite body style (flex centering) dynamically so that position: sticky functions correctly
  useEffect(() => {
    const originalDisplay = document.body.style.display;
    const originalPlaceItems = document.body.style.placeItems;
    const originalHtmlOverflow = document.documentElement.style.overflowY;
    const originalBodyOverflow = document.body.style.overflowY;

    document.body.style.display = 'block';
    document.body.style.placeItems = 'initial';
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';

    return () => {
      document.body.style.display = originalDisplay;
      document.body.style.placeItems = originalPlaceItems;
      document.documentElement.style.overflowY = originalHtmlOverflow;
      document.body.style.overflowY = originalBodyOverflow;
    };
  }, []);

  // Helper to draw a frame on the canvas with cover sizing
  const drawFrame = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Scale canvas to match viewport size
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Calculate aspect ratio cover sizing
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      drawHeight = height;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  };

  // 🚀 Load Frame 1 immediately, then progressively preload remaining frames
  useEffect(() => {
    const firstFrame = new Image();
    firstFrame.src = '/animations/cleaning/ezgif-frame-001.png';
    firstFrame.onload = () => {
      frameCache.current[1] = firstFrame;
      drawFrame(firstFrame);
    };

    // Load rest progressively in small batches to avoid blocking connection pool
    let active = true;
    const preloadBatch = async () => {
      const concurrency = 4;
      for (let i = 2; i <= totalFrames; i += concurrency) {
        if (!active) break;
        const promises = [];
        for (let j = 0; j < concurrency && i + j <= totalFrames; j++) {
          const frameNum = i + j;
          promises.push(
            new Promise((resolve) => {
              const img = new Image();
              const frameStr = frameNum.toString().padStart(3, '0');
              img.src = `/animations/cleaning/ezgif-frame-${frameStr}.png`;
              img.onload = () => {
                frameCache.current[frameNum] = img;
                resolve();
              };
              img.onerror = () => resolve(); // continue if one fails
            })
          );
        }
        await Promise.all(promises);
      }
    };

    preloadBatch();

    return () => {
      active = false;
    };
  }, []);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const currentProgress = scrollProgress;
      const totalSteps = totalFrames - 1;
      const frameIndex = Math.max(1, Math.min(totalFrames, Math.round(currentProgress * totalSteps) + 1));
      const cachedImage = frameCache.current[frameIndex];
      if (cachedImage) {
        drawFrame(cachedImage);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollProgress]);

  // Track scrolling and update canvas on frame changes
  useEffect(() => {
    let animationFrameId = null;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollHeight = container.scrollHeight - window.innerHeight;
      const relativeScroll = -rect.top;
      
      const rawProgress = scrollHeight > 0 ? relativeScroll / scrollHeight : 0;
      const progress = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(progress);

      const render = () => {
        const totalSteps = totalFrames - 1;
        const frameIndex = Math.max(1, Math.min(totalFrames, Math.round(progress * totalSteps) + 1));
        
        // Find nearest loaded frame if current isn't loaded yet
        let imgToDraw = frameCache.current[frameIndex];
        if (!imgToDraw) {
          // Search outwards for closest preloaded frame
          for (let offset = 1; offset < totalFrames; offset++) {
            const nextFrame = frameIndex + offset;
            const prevFrame = frameIndex - offset;
            if (nextFrame <= totalFrames && frameCache.current[nextFrame]) {
              imgToDraw = frameCache.current[nextFrame];
              break;
            }
            if (prevFrame >= 1 && frameCache.current[prevFrame]) {
              imgToDraw = frameCache.current[prevFrame];
              break;
            }
          }
        }

        if (imgToDraw) {
          drawFrame(imgToDraw);
        }
      };

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial draw trigger
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Determine visibility classes for overlay sections
  const getSectionClass = (start, end) => {
    return scrollProgress >= start && scrollProgress <= end ? 'active' : '';
  };

  const isScrolledPast = scrollProgress >= 0.99;

  return (
    <div ref={containerRef} className="scroll-animation-container">
      <div className={`sticky-canvas-wrapper ${isScrolledPast ? 'scrolled-past' : ''}`}>
        <canvas ref={canvasRef} className="scroll-animation-canvas" />
      </div>

      {/* OVERLAY SECTION 1 (12% - 32% scroll progress) */}
      <div className={`overlay-section s1 ${getSectionClass(0.12, 0.32)}`}>
        <div className="glass-overlay">
          <h2 className="overlay-title">Book. Relax. We Clean.</h2>
          <p className="overlay-desc">Professional home services at your doorstep.</p>
        </div>
      </div>

      {/* OVERLAY SECTION 2 (42% - 62% scroll progress) */}
      <div className={`overlay-section s2 ${getSectionClass(0.42, 0.62)}`}>
        <div className="glass-overlay">
          <h2 className="overlay-title">Trusted Cleaning Experts</h2>
          <p className="overlay-desc">Verified professionals delivering reliable and high-quality services.</p>
        </div>
      </div>

      {/* OVERLAY SECTION 3 (72% - 92% scroll progress) */}
      <div className={`overlay-section s3 ${getSectionClass(0.72, 0.92)}`}>
        <div className="glass-overlay">
          <h2 className="overlay-title">Professional Home Services</h2>
          <p className="overlay-desc">Book trusted home services with ServiceHub.</p>
        </div>
      </div>
    </div>
  );
};

export default ScrollAnimationHero;
