// Blob Cursor - Vanilla JavaScript Implementation
class BlobCursor {
  constructor(options = {}) {
    this.blobType = options.blobType || 'circle';
    this.fillColor = options.fillColor || '#154734'; // ASUO primary green
    this.trailCount = options.trailCount || 3;
    this.sizes = options.sizes || [60, 125, 75];
    this.innerSizes = options.innerSizes || [20, 35, 25];
    this.innerColor = options.innerColor || 'rgba(244, 211, 94, 0.8)'; // ASUO accent yellow
    this.opacities = options.opacities || [0.6, 0.6, 0.6];
    this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.75)';
    this.shadowBlur = options.shadowBlur || 5;
    this.shadowOffsetX = options.shadowOffsetX || 10;
    this.shadowOffsetY = options.shadowOffsetY || 10;
    this.filterId = options.filterId || 'blob';
    this.filterStdDeviation = options.filterStdDeviation || 30;
    this.filterColorMatrixValues = options.filterColorMatrixValues || '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10';
    this.useFilter = options.useFilter !== false;
    this.fastDuration = options.fastDuration || 0.1;
    this.slowDuration = options.slowDuration || 0.5;
    this.zIndex = options.zIndex || 100;

    this.container = null;
    this.blobs = [];
    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.animationFrame = null;

    this.init();
  }

  init() {
    // Don't show on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    this.createContainer();
    this.createFilter();
    this.createBlobs();
    this.attachListeners();
    this.animate();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'blob-container';
    this.container.style.zIndex = this.zIndex;
    document.body.appendChild(this.container);

    const blobMain = document.createElement('div');
    blobMain.className = 'blob-main';
    if (this.useFilter) {
      blobMain.style.filter = `url(#${this.filterId})`;
    }
    this.container.appendChild(blobMain);
    this.containerMain = blobMain;
  }

  createFilter() {
    if (!this.useFilter) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position: absolute; width: 0; height: 0;');
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', this.filterId);

    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('result', 'blur');
    blur.setAttribute('stdDeviation', this.filterStdDeviation);

    const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    colorMatrix.setAttribute('in', 'blur');
    colorMatrix.setAttribute('values', this.filterColorMatrixValues);

    filter.appendChild(blur);
    filter.appendChild(colorMatrix);
    svg.appendChild(filter);
    this.container.appendChild(svg);
  }

  createBlobs() {
    for (let i = 0; i < this.trailCount; i++) {
      const blob = document.createElement('div');
      blob.className = 'blob';
      
      const size = this.sizes[i] || 60;
      const borderRadius = this.blobType === 'circle' ? '50%' : '0%';
      
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      blob.style.borderRadius = borderRadius;
      blob.style.backgroundColor = this.fillColor;
      blob.style.opacity = this.opacities[i] || 0.6;
      blob.style.boxShadow = `${this.shadowOffsetX}px ${this.shadowOffsetY}px ${this.shadowBlur}px 0 ${this.shadowColor}`;
      blob.style.transform = 'translate3d(-50%, -50%, 0)';
      blob.style.transition = `transform ${i === 0 ? this.fastDuration : this.slowDuration}s ${i === 0 ? 'ease-out' : 'ease-out'}`;

      const innerDot = document.createElement('div');
      innerDot.className = 'inner-dot';
      const innerSize = this.innerSizes[i] || 20;
      innerDot.style.width = `${innerSize}px`;
      innerDot.style.height = `${innerSize}px`;
      innerDot.style.top = `${(size - innerSize) / 2}px`;
      innerDot.style.left = `${(size - innerSize) / 2}px`;
      innerDot.style.backgroundColor = this.innerColor;
      innerDot.style.borderRadius = borderRadius;

      blob.appendChild(innerDot);
      this.containerMain.appendChild(blob);
      this.blobs.push(blob);
    }
  }

  attachListeners() {
    document.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
    });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetX = e.touches[0].clientX;
        this.targetY = e.touches[0].clientY;
      }
    });
  }

  animate() {
    // Smooth interpolation for the lead blob
    const factor = 0.15;
    this.currentX += (this.targetX - this.currentX) * factor;
    this.currentY += (this.targetY - this.currentY) * factor;

    // Update lead blob immediately
    if (this.blobs[0]) {
      this.blobs[0].style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
    }

    // Trail blobs follow with delay
    this.blobs.forEach((blob, i) => {
      if (i === 0) return; // Skip lead blob

      const delay = i * 0.05; // Stagger the trail
      setTimeout(() => {
        const factor = 0.1 + (i * 0.05);
        const match = blob.style.transform.match(/translate3d\(([^,]+),\s*([^,]+)/);
        let blobX = match ? parseFloat(match[1]) : 0;
        let blobY = match ? parseFloat(match[2]) : 0;
        
        blobX += (this.currentX - blobX) * factor;
        blobY += (this.currentY - blobY) * factor;
        
        blob.style.transform = `translate3d(${blobX}px, ${blobY}px, 0)`;
      }, delay * 1000);
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

// Initialize blob cursor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on index page
  if (document.body.classList.contains('index-page')) {
    window.blobCursor = new BlobCursor({
      blobType: 'circle',
      fillColor: '#154734', // ASUO primary green
      innerColor: 'rgba(244, 211, 94, 0.8)', // ASUO accent yellow
      trailCount: 3,
      sizes: [30, 60, 40],
      innerSizes: [10, 18, 12],
      opacities: [0.6, 0.6, 0.6],
      useFilter: true, // Re-enable filter for blob effect
      filterStdDeviation: 12 // Reduced blur for sharper blob effect
    });
  }
});

