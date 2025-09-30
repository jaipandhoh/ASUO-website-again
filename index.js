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

// Initialize Aurora Effect
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Aurora effect...');
  setTimeout(() => {
    new AuroraEffect('aurora-container');
  }, 100);
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
      
      // Use local JSON directly since Google Sheets URL is not working
      let events = [];
      
      try {
        console.log('🔄 Loading events from local JSON...');
        events = await this.loadFromLocalJSON();
        console.log('✅ Successfully loaded events from local JSON');
      } catch (jsonError) {
        console.log('⚠️ Local JSON failed, trying Google Sheets...', jsonError);
        events = await this.loadFromGoogleSheets();
        console.log('✅ Successfully loaded events from Google Sheets');
      }
      
      this.events = events;
      this.filterEvents();
      
    } catch (error) {
      console.error('❌ Error loading events:', error);
      this.showError();
    }
  }

  async loadFromGoogleSheets() {
    // Replace this URL with your Google Sheets CSV export URL
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqhC-waBGOSA1dqvoQk2Q0gsQPUDWLJqwJbSgihrhvVxcekCvNUe2Jtp9EB7JYM1mnr9d7gP-TatPP/pub?output=csv';
    
    const response = await fetch(sheetsUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets request failed: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📄 CSV received from Google Sheets');
    
    return this.parseCSVToEvents(csvText);
  }

  async loadFromLocalJSON() {
    const response = await fetch('./events.json');
    if (!response.ok) {
      throw new Error('Failed to load local events');
    }
    return await response.json();
  }

  parseCSVToEvents(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    console.log('📋 CSV Headers:', headers);
    
    const events = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;
      
      const event = {};
      
      // Map CSV columns to event properties
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
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
          case 'tags':
            event.tags = value ? value.split(';').map(t => t.trim()) : [];
            break;
          case 'start_date':
          case 'date':
            event.start_date = value;
            break;
          case 'start_time':
          case 'time':
            event.start_time = value;
            break;
          case 'end_time':
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
            event.rsvp_url = value;
            break;
          case 'is_free':
          case 'free':
            event.is_free = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
            break;
          case 'capacity':
            event.capacity = parseInt(value) || 1000;
            break;
        }
      });
      
      // Generate ID if not provided
      event.id = `ev_${String(i).padStart(3, '0')}`;
      
      // Set defaults for required fields
      event.org = event.org || 'ASUO';
      event.category = event.category || 'social';
      event.tags = event.tags || ['free'];
      event.location_name = event.location_name || 'TBD';
      event.address = event.address || 'University of Oregon, Eugene, OR';
      event.summary = event.summary || 'Join us for this exciting event!';
      event.is_free = event.is_free !== false;
      event.capacity = event.capacity || 1000;
      
      // Create ISO dates
      if (event.start_date && event.start_time) {
        const dateStr = `${event.start_date} ${event.start_time}`;
        const startDate = new Date(dateStr);
        const endDate = event.end_time ? new Date(`${event.start_date} ${event.end_time}`) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
        
        event.start_iso = startDate.toISOString();
        event.end_iso = endDate.toISOString();
      } else {
        // Default dates if not provided
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7); // 1 week from now
        event.start_iso = defaultDate.toISOString();
        event.end_iso = new Date(defaultDate.getTime() + 2 * 60 * 60 * 1000).toISOString();
      }
      
      // Create location object
      event.location = {
        name: event.location_name,
        address: event.address,
        lat: 44.045,
        lng: -123.07,
        is_virtual: false,
        join_url: ''
      };
      
      // Create price object
      event.price = {
        currency: 'USD',
        amount: event.is_free ? 0 : 10,
        is_free: event.is_free
      };
      
      // Create capacity object
      event.capacity = {
        max: event.capacity,
        remaining: event.capacity
      };
      
      // Add timestamps
      event.created_at = new Date().toISOString();
      event.updated_at = new Date().toISOString();
      
      // Add timezone
      event.timezone = 'America/Los_Angeles';
      
      // Add description
      event.description_md = event.summary;
      
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
  const dropdown = document.querySelector('.dropdown');
  const toggle = dropdown.querySelector('.dropdown-toggle');
  const menu = dropdown.querySelector('.dropdown-menu');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    menu.classList.remove('show');
  });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});
