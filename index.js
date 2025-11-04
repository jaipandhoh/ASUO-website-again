// Aurora Effect
class AuroraEffect {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.time = 0;
    
    console.log('AuroraEffect constructor called for:', containerId);
    console.log('Container found:', this.container);
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Container not found for Aurora effect');
      return;
    }
    
    console.log('Initializing Aurora effect...');
    
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
    
    if (!this.gl) {
      console.warn('WebGL not supported, Aurora effect disabled');
      return;
    }

    console.log('WebGL context created successfully');
    console.log('WebGL version:', this.gl.getParameter(this.gl.VERSION));
    
    this.setupWebGL();
    this.createShaders();
    this.createGeometry();
    this.setupResize();
    this.animate();
    
    // Add canvas to container
    this.container.appendChild(this.canvas);
    console.log('Canvas added to container');
    
    // Test: Make sure canvas is visible
    this.canvas.style.border = '2px solid red';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
    console.log('Container dimensions:', this.container.offsetWidth, 'x', this.container.offsetHeight);
  }

  setupWebGL() {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0, 0, 0, 0);
  }

  createShaders() {
    console.log('Creating shaders...');
    
    // Very simple vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    if (!vertexShader) {
      console.error('Failed to create vertex shader');
      return;
    }
    console.log('Vertex shader created successfully');

    // Very simple fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform float uTime;
      uniform vec2 uResolution;
      
      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float time = uTime * 0.5;
        
        // Simple animated pattern
        float wave = sin(uv.x * 8.0 + time) * 0.5 + 0.5;
        wave *= sin(uv.y * 6.0 + time * 0.8) * 0.5 + 0.5;
        
        // ASUO colors
        vec3 green = vec3(0.059, 0.298, 0.227);
        vec3 yellow = vec3(1.000, 0.824, 0.000);
        vec3 lightGreen = vec3(0.104, 0.420, 0.310);
        
        vec3 color = mix(green, yellow, wave);
        color = mix(color, lightGreen, uv.x);
        
        gl_FragColor = vec4(color, wave * 0.3);
      }
    `;
    
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!fragmentShader) {
      console.error('Failed to create fragment shader');
      return;
    }
    console.log('Fragment shader created successfully');

    console.log('Both shaders created successfully');
    this.program = this.createProgram(vertexShader, fragmentShader);
    
    if (!this.program) {
      console.error('Failed to create program');
      return;
    }
    
    this.gl.useProgram(this.program);
    console.log('Program created and activated successfully');
  }

  createShader(type, source) {
    console.log('Creating shader of type:', type === this.gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT');
    console.log('Shader source:', source);
    
    const shader = this.gl.createShader(type);
    if (!shader) {
      console.error('Failed to create shader object');
      return null;
    }
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const errorLog = this.gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', errorLog);
      console.error('Shader source that failed:', source);
      this.gl.deleteShader(shader);
      return null;
    }
    
    console.log('Shader compiled successfully');
    return shader;
  }

  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getShaderParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getShaderInfoLog(program));
      return null;
    }
    
    return program;
  }

  createGeometry() {
    console.log('Creating geometry...');
    
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);

    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(this.program, 'position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    console.log('Geometry created successfully');
  }

  setupResize() {
    const resize = () => {
      if (this.canvas && this.gl) {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.gl.getUniformLocation(this.program, 'uResolution'), this.canvas.width, this.canvas.height);
      }
    };

    window.addEventListener('resize', resize);
    resize();
  }

  animate() {
    console.log('Starting animation...');
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      if (this.gl && this.program) {
        this.time += 0.01;
        
        // Set time uniform
        const timeLocation = this.gl.getUniformLocation(this.program, 'uTime');
        if (timeLocation) {
          this.gl.uniform1f(timeLocation, this.time);
        }
        
        // Set resolution uniform
        const resolutionLocation = this.gl.getUniformLocation(this.program, 'uResolution');
        if (resolutionLocation) {
          this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
        }
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
    };

    animate();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
  }
}

// Photo Rotator
class PhotoRotator {
  constructor() {
    this.slides = document.querySelectorAll('.photo-slide');
    this.indicators = document.querySelectorAll('.photo-indicator');
    this.prevBtn = document.querySelector('.photo-prev');
    this.nextBtn = document.querySelector('.photo-next');
    this.currentSlide = 0;
    this.autoPlayInterval = null;
    this.isPaused = false;
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupEventListeners();
    this.startAutoPlay();
    this.updateSlide();
  }

  setupEventListeners() {
    // Previous button
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousSlide());
    }

    // Next button
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Pause on hover
    const photoRotator = document.querySelector('.photo-rotator');
    if (photoRotator) {
      photoRotator.addEventListener('mouseenter', () => this.pauseAutoPlay());
      photoRotator.addEventListener('mouseleave', () => this.resumeAutoPlay());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pauseAutoPlay();
    }
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 4000); // Change slide every 4 seconds
  }

  pauseAutoPlay() {
    this.isPaused = true;
  }

  resumeAutoPlay() {
    this.isPaused = false;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlide();
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlide();
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlide();
  }

  updateSlide() {
    // Update slides
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });

    // Update indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
  }
}

// Hero Rotator
class HeroRotator {
  constructor() {
    this.slides = document.querySelectorAll('.hero-slide');
    this.indicators = document.querySelectorAll('.hero-indicator');
    this.prevBtn = document.querySelector('.hero-prev');
    this.nextBtn = document.querySelector('.hero-next');
    this.currentSlide = 0;
    this.autoPlayInterval = null;
    this.isPaused = false;
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupEventListeners();
    this.startAutoPlay();
    this.updateSlide();
  }

  setupEventListeners() {
    // Previous/Next buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousSlide());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Pause on hover
    const rotator = document.querySelector('.hero-rotator');
    if (rotator) {
      rotator.addEventListener('mouseenter', () => this.pauseAutoPlay());
      rotator.addEventListener('mouseleave', () => this.resumeAutoPlay());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.stopAutoPlay();
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlide();
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlide();
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlide();
  }

  updateSlide() {
    // Update slides
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });

    // Update indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 5000); // 5 seconds
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  pauseAutoPlay() {
    this.isPaused = true;
  }

  resumeAutoPlay() {
    this.isPaused = false;
  }
}

// Initialize Aurora Effect
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Aurora effect...');
  setTimeout(() => {
    new AuroraEffect('aurora-container');
  }, 100);
  
  // Initialize Photo Rotator
  new PhotoRotator();
  
  // Initialize Hero Rotator
  new HeroRotator();
});

// Campus Events System
class CampusEventsManager {
  constructor() {
    this.eventsContainer = document.getElementById('eventsList');
    this.searchInput = document.getElementById('eventsSearch');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.emptyState = document.getElementById('emptyState');
    this.errorState = document.getElementById('errorState');
    this.loadingState = this.eventsContainer.querySelector('.loading-state');
    
    this.events = [];
    this.filteredEvents = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadEvents();
    // Refresh events every 10 minutes
    setInterval(() => this.loadEvents(), 10 * 60 * 1000);
  }

  setupEventListeners() {
    // Search functionality
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.filterEvents();
    });

    // Filter tabs
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.setActiveFilter(e.target.dataset.filter);
        this.filterEvents();
      });
    });
  }

  setActiveFilter(filter) {
    this.currentFilter = filter;
    this.filterTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === filter);
    });
  }

  async loadEvents() {
    try {
      this.showLoading();
      let events = [];

      // Prefer local JSON so the page always shows events, then update from Sheets if available
      try {
        console.log('🔄 Loading events from local JSON...');
        events = await this.loadFromLocalJSON();
        console.log('✅ Successfully loaded events from local JSON');
      } catch (jsonError) {
        console.warn('⚠️ Local JSON failed, trying Google Sheets...', jsonError);
        events = await this.loadFromGoogleSheets();
        console.log('✅ Successfully loaded events from Google Sheets');
      }

      this.events = events;
      this.filterEvents();

      // Try refreshing from Sheets in the background even if local worked
      this.loadFromGoogleSheets()
        .then(sheetEvents => {
          if (Array.isArray(sheetEvents) && sheetEvents.length) {
            this.events = sheetEvents;
            this.filterEvents();
            console.log('🔁 Events refreshed from Google Sheets in background');
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error('❌ Error loading events:', error);
      this.showError();
    }
  }

  async loadFromGoogleSheets() {
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1gfu3GyIrpyA3CxvfuJNf938VZNAoyaVhimbs3Q1k7WE/export?format=csv&gid=0';

    const response = await fetch(sheetsUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Google Sheets request failed: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('📄 CSV received from Google Sheets');

    return this.parseCSVToEvents(csvText);
  }

  // Basic RFC 4180-ish CSV parser that handles quotes and commas
  parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let i = 0;
    let inQuotes = false;

    while (i < text.length) {
      const char = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') { // escaped quote
          cell += '"';
          i += 2;
          continue;
        }
        if (char === '"') {
          inQuotes = false;
          i += 1;
          continue;
        }
        cell += char;
        i += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }

      if (char === ',') {
        row.push(cell.trim());
        cell = '';
        i += 1;
        continue;
      }

      if (char === '\n' || char === '\r') {
        // finalize row
        if (cell.length || row.length) {
          row.push(cell.trim());
          rows.push(row);
          row = [];
          cell = '';
        }
        // consume both CRLF if present
        if (char === '\r' && next === '\n') i += 2; else i += 1;
        continue;
      }

      cell += char;
      i += 1;
    }

    // flush last cell/row
    if (cell.length || row.length) {
      row.push(cell.trim());
      rows.push(row);
    }

    return rows;
  }

  parseCSVToEvents(csvText) {
    const rows = this.parseCSV(csvText);
    if (!rows.length) return [];

    const headers = rows[0].map(h => h.trim().toLowerCase());
    console.log('📋 CSV Headers:', headers);

    const events = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (!values || !values.length) continue;

      const event = {};

      headers.forEach((header, index) => {
        const value = (values[index] || '').trim();
        switch (header) {
          case 'title':
            event.title = value;
            break;
          case 'org':
          case 'organization':
            event.org = value;
            break;
          case 'category':
            event.category = value;
            break;
          case 'tags': {
            const sep = value.includes(';') ? ';' : ',';
            event.tags = value ? value.split(sep).map(t => t.trim()).filter(Boolean) : [];
            break;
          }
          case 'start_date':
          case 'date':
          case 'start':
            event.start_date = value;
            break;
          case 'start_time':
          case 'time':
            event.start_time = value;
            break;
          case 'end_time':
          case 'end':
            event.end_time = value;
            break;
          case 'location':
          case 'location_name':
            event.location_name = value;
            break;
          case 'address':
            event.address = value;
            break;
          case 'summary':
          case 'description':
            event.summary = value;
            break;
          case 'rsvp_url':
          case 'rsvp':
          case 'link':
            event.rsvp_url = value;
            break;
          case 'is_free':
          case 'free':
            event.is_free = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
            break;
          case 'capacity':
            event.capacity = value;
            break;
          case 'image':
          case 'image_url':
            event.image_url = value;
            break;
        }
      });

      // If a single ISO datetime provided in start field, split into date/time
      if (!event.start_time && event.start_date && /t/i.test(event.start_date)) {
        const parts = event.start_date.split(/[t\s]/i);
        event.start_date = parts[0];
        event.start_time = parts[1] || '';
      }

      events.push(event);
    }

    console.log('📅 Parsed events from CSV:', events);
    return events;
  }

  filterEvents() {
    this.filteredEvents = this.events.filter(event => {
      // Category filter
      const categoryMatch = this.currentFilter === 'all' || event.category === this.currentFilter;
      
      // Search filter
      const searchMatch = !this.searchQuery || 
        event.title.toLowerCase().includes(this.searchQuery) ||
        event.org.toLowerCase().includes(this.searchQuery) ||
        event.location.name.toLowerCase().includes(this.searchQuery) ||
        event.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)) ||
        event.summary.toLowerCase().includes(this.searchQuery);
      
      return categoryMatch && searchMatch;
    });

    this.renderEvents();
  }

  showLoading() {
    this.loadingState.style.display = 'grid';
    this.emptyState.style.display = 'none';
    this.errorState.style.display = 'none';
  }

  showError() {
    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.errorState.style.display = 'block';
  }

  showEmpty() {
    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'block';
    this.errorState.style.display = 'none';
  }

  renderEvents() {
    if (this.filteredEvents.length === 0) {
      this.showEmpty();
      return;
    }

    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.errorState.style.display = 'none';

    const html = this.filteredEvents.map(event => this.createEventCard(event)).join('');
    this.eventsContainer.innerHTML = html;
  }

  createEventCard(event) {
    const startDate = new Date(event.start_iso);
    const endDate = new Date(event.end_iso);
    
    const badges = this.createEventBadges(event);
    const tags = event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('');
    
    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-image">
          ${event.image_url ? 
            `<img src="${event.image_url}" alt="${event.title}" loading="lazy">` : 
            `<div class="event-image-placeholder"></div>`
          }
          <div class="event-badges">
            ${badges}
          </div>
        </div>
        
        <div class="event-content">
          <div class="event-meta">
            <span class="event-org">${event.org}</span>
            <span class="event-category">${event.category}</span>
          </div>
          
          <h3 class="event-title">${event.title}</h3>
          <p class="event-summary">${event.summary}</p>
          
          <div class="event-details">
            <div class="event-detail">
              <i class="fas fa-clock"></i>
              <span>${this.formatTime(startDate, endDate)}</span>
            </div>
            <div class="event-detail">
              <i class="fas fa-map-marker-alt"></i>
              <span>${event.location.name}</span>
            </div>
          </div>
          
          <div class="event-tags">
            ${tags}
          </div>
          
          <div class="event-actions">
            ${event.rsvp_url ? 
              `<a href="${event.rsvp_url}" class="event-action primary" target="_blank">
                <i class="fas fa-check"></i> RSVP
              </a>` : ''
            }
            <button class="event-action" onclick="addToCalendar('${event.id}')">
              <i class="fas fa-calendar-plus"></i> Calendar
            </button>
            <button class="event-action" onclick="shareEvent('${event.id}')">
              <i class="fas fa-share"></i> Share
            </button>
            ${!event.location.is_virtual ? 
              `<button class="event-action" onclick="getDirections('${event.location.lat}', '${event.location.lng}')">
                <i class="fas fa-directions"></i> Directions
              </button>` : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  createEventBadges(event) {
    const badges = [];
    
    if (event.price.is_free) {
      badges.push('<span class="event-badge free">Free</span>');
    }
    
    if (event.capacity.remaining < 10) {
      badges.push('<span class="event-badge limited">Limited</span>');
    }
    
    // Check if event is new (created within last 7 days)
    const createdDate = new Date(event.created_at);
    const now = new Date();
    const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 7) {
      badges.push('<span class="event-badge new">New</span>');
    }
    
    return badges.join('');
  }

  formatDate(date) {
    return '';
  }

  formatTime(startDate, endDate) {
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${startTime} - ${endTime}`;
  }
}

// Global functions for event actions
function addToCalendar(eventId) {
  const event = campusEventsManager.events.find(e => e.id === eventId);
  if (!event) return;
  
  const startDate = new Date(event.start_iso);
  const endDate = new Date(event.end_iso);
  
  // Create ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ASUO//Campus Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@asuogov.com`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.summary}\\n\\n${event.description_md}`,
    `LOCATION:${event.location.name}, ${event.location.address}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  // Download ICS file
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function shareEvent(eventId) {
  const event = campusEventsManager.events.find(e => e.id === eventId);
  if (!event) return;
  
  const shareData = {
    title: event.title,
    text: event.summary,
    url: window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback: copy to clipboard
    const text = `${event.title}\n${event.summary}\n${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Event details copied to clipboard!');
    });
  }
}

function getDirections(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
}

function clearAllFilters() {
  campusEventsManager.setActiveFilter('all');
  campusEventsManager.searchInput.value = '';
  campusEventsManager.searchQuery = '';
  campusEventsManager.filterEvents();
}

function retryLoadEvents() {
  campusEventsManager.loadEvents();
}

// Legacy Content Management System (for announcements)
class ContentManager {
  constructor() {
    this.announcementsContainer = document.getElementById('announcementsList');
    this.init();
  }

  async init() {
    await this.loadAnnouncements();
    // Refresh content every 5 minutes
    setInterval(() => this.loadAnnouncements(), 5 * 60 * 1000);
  }

  async loadAnnouncements() {
    try {
      // Option 1: Load from JSON file (you'll need to update this file weekly)
      const response = await fetch('/data/announcements.json');
      if (!response.ok) {
        // Fallback to static data if file doesn't exist
        this.renderAnnouncements(this.getStaticAnnouncements());
        return;
      }
      const announcements = await response.json();
      this.renderAnnouncements(announcements);
    } catch (error) {
      // Fallback to static content
      this.renderAnnouncements(this.getStaticAnnouncements());
    }
  }

  getStaticAnnouncements() {
    return [
      {
        id: 1,
        text: "Student-led chat this Thursday! Cookies and drinks provided.",
        date: "2025-07-21"
      },
      {
        id: 2,
        text: "Applications for Fall Leadership positions now open.",
        date: "2025-07-20"
      }
    ];
  }

  renderAnnouncements(announcements) {
    if (!announcements || announcements.length === 0) {
      this.announcementsContainer.innerHTML = '<div class="error-message">No announcements available</div>';
      return;
    }

    const html = announcements.map(announcement => `
      <div class="announcement">
        <p class="announcement-text">${announcement.text}</p>
        ${announcement.date ? `<small style="color: var(--text-muted); font-size: 0.9em;">${new Date(announcement.date).toLocaleDateString()}</small>` : ''}
      </div>
    `).join('');

    this.announcementsContainer.innerHTML = html;
  }
}

// Back Button Functionality
class BackButtonManager {
  constructor() {
    this.init();
  }

  init() {
    // Add back button to all pages except index.html
    if (!document.body.classList.contains('index-page')) {
      this.addBackButton();
    }
  }

  addBackButton() {
    const backButton = document.createElement('a');
    backButton.className = 'back-button';
    backButton.href = '#';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backButton.setAttribute('aria-label', 'Go back to previous page');
    backButton.title = 'Go back';
    
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.goBack();
    });

    document.body.appendChild(backButton);
  }

  goBack() {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      // Try to go back in browser history
      window.history.back();
    } else {
      // Fallback: go to homepage
      window.location.href = 'index.html';
    }
  }
}

// Initialize managers
const contentManager = new ContentManager();
const campusEventsManager = new CampusEventsManager();
const backButtonManager = new BackButtonManager();

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
  }
});

// Dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
  // Handle all dropdowns
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other dropdowns first
        dropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.querySelector('.dropdown-menu').classList.remove('show');
            // Also close all submenus in other dropdowns
            const otherSubmenus = otherDropdown.querySelectorAll('.dropdown-submenu');
            otherSubmenus.forEach(submenu => {
              submenu.classList.remove('active');
            });
          }
        });
        
        // Toggle current dropdown
        menu.classList.toggle('show');
        
        // If closing current dropdown, also close its submenus
        if (!menu.classList.contains('show')) {
          const currentSubmenus = dropdown.querySelectorAll('.dropdown-submenu');
          currentSubmenus.forEach(submenu => {
            submenu.classList.remove('active');
          });
        }
      });
    }
  });

  // Submenu functionality - handle all submenus
  const submenuToggles = document.querySelectorAll('.dropdown-submenu-toggle');
  
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const submenu = toggle.closest('.dropdown-submenu');
      const parentDropdown = submenu.closest('.dropdown');
      
      if (submenu) {
        // Close all other submenus in the same dropdown
        const allSubmenus = parentDropdown.querySelectorAll('.dropdown-submenu');
        allSubmenus.forEach(otherSubmenu => {
          if (otherSubmenu !== submenu) {
            otherSubmenu.classList.remove('active');
          }
        });
        
        // Toggle current submenu
        submenu.classList.toggle('active');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    // Close all dropdowns
    dropdowns.forEach(dropdown => {
      dropdown.querySelector('.dropdown-menu').classList.remove('show');
    });
    
    // Close all submenus
    const allSubmenus = document.querySelectorAll('.dropdown-submenu');
    allSubmenus.forEach(submenu => {
      submenu.classList.remove('active');
    });
  });
});

// Futuristic Reveal Effect on Scroll
const futuristicElements = document.querySelectorAll('.futuristic-reveal');

const futuristicObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

futuristicElements.forEach(element => {
  futuristicObserver.observe(element);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      // Use scroll-margin-top if available, otherwise use larger offset
      const navbarHeight = 100;
      const offsetTop = target.offsetTop - navbarHeight;
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth'
      });
    }
  });
});
