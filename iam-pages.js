// I Am Pages Accordion Functionality
class IAmAccordion {
  constructor() {
    this.accordionItems = document.querySelectorAll('.accordion-item');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.accordionItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      if (header) {
        header.addEventListener('click', () => this.toggleAccordion(item));
        
        // Keyboard accessibility
        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleAccordion(item);
          }
        });
      }
    });
  }

  toggleAccordion(item) {
    const isActive = item.classList.contains('active');
    
    // Close all accordion items
    this.accordionItems.forEach(otherItem => {
      otherItem.classList.remove('active');
      const otherHeader = otherItem.querySelector('.accordion-header');
      if (otherHeader) {
        otherHeader.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
      item.classList.add('active');
      const header = item.querySelector('.accordion-header');
      if (header) {
        header.setAttribute('aria-expanded', 'true');
      }
    }
  }
}

// Initialize accordion when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new IAmAccordion();
});
