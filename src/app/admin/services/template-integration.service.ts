import { Injectable } from '@angular/core';

export interface TemplateConfig {
  name: string;
  version: string;
  description: string;
  layout: 'sidebar' | 'topbar' | 'hybrid';
  components: {
    header: boolean;
    sidebar: boolean;
    footer: boolean;
    breadcrumbs: boolean;
  };
  styling: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: string;
    customVariables: Record<string, string>;
  };
}

export interface LayoutSection {
  id: string;
  name: string;
  component: string;
  order: number;
  visible: boolean;
  customProps?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateIntegrationService {
  private currentTemplate: TemplateConfig | null = null;
  private layoutSections: LayoutSection[] = [
    {
      id: 'header',
      name: 'Dashboard Header',
      component: 'DashboardHeaderComponent',
      order: 1,
      visible: true
    },
    {
      id: 'filters',
      name: 'Filters Section',
      component: 'FiltersComponent',
      order: 2,
      visible: true
    },
    {
      id: 'metrics',
      name: 'Key Metrics Cards',
      component: 'MetricsComponent',
      order: 3,
      visible: true
    },
    {
      id: 'charts',
      name: 'Analytics Charts',
      component: 'ChartsComponent',
      order: 4,
      visible: true
    },
    {
      id: 'tables',
      name: 'Data Tables',
      component: 'TablesComponent',
      order: 5,
      visible: true
    }
  ];

  constructor() {}

  /**
   * Apply a new template configuration
   */
  applyTemplate(template: TemplateConfig): void {
    this.currentTemplate = template;
    this.applyStyling(template.styling);
    console.log('🎨 Template applied:', template.name);
  }

  /**
   * Get current template configuration
   */
  getCurrentTemplate(): TemplateConfig | null {
    return this.currentTemplate;
  }

  /**
   * Update layout sections order and visibility
   */
  updateLayoutSections(sections: LayoutSection[]): void {
    this.layoutSections = sections.sort((a, b) => a.order - b.order);
  }

  /**
   * Get current layout sections
   */
  getLayoutSections(): LayoutSection[] {
    return this.layoutSections.filter(section => section.visible);
  }

  /**
   * Apply custom styling variables
   */
  private applyStyling(styling: TemplateConfig['styling']): void {
    const root = document.documentElement;
    
    // Apply custom CSS variables
    Object.entries(styling.customVariables).forEach(([key, value]) => {
      root.style.setProperty(`--template-${key}`, value);
    });

    // Apply theme class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${styling.theme}`);
  }

  /**
   * Convert HTML template to Angular template structure
   */
  parseHtmlTemplate(htmlContent: string): {
    structure: any;
    styles: string;
    scripts: string;
  } {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Extract different sections
    const structure = this.extractStructure(tempDiv);
    const styles = this.extractStyles(tempDiv);
    const scripts = this.extractScripts(tempDiv);

    return { structure, styles, scripts };
  }

  /**
   * Extract structural information from HTML
   */
  private extractStructure(element: HTMLElement): any {
    const structure: any = {
      navigation: null,
      header: null,
      sidebar: null,
      content: null,
      footer: null
    };

    // Look for common navigation patterns
    const nav = element.querySelector('nav, .navbar, .navigation, .nav-wrapper');
    if (nav) {
      structure.navigation = this.elementToAngularTemplate(nav);
    }

    // Look for header patterns
    const header = element.querySelector('header, .header, .page-header, .dashboard-header');
    if (header) {
      structure.header = this.elementToAngularTemplate(header);
    }

    // Look for sidebar patterns
    const sidebar = element.querySelector('.sidebar, .sidenav, .side-navigation, .menu-sidebar');
    if (sidebar) {
      structure.sidebar = this.elementToAngularTemplate(sidebar);
    }

    // Look for main content area
    const content = element.querySelector('main, .main-content, .content, .dashboard-content');
    if (content) {
      structure.content = this.elementToAngularTemplate(content);
    }

    // Look for footer patterns
    const footer = element.querySelector('footer, .footer, .page-footer');
    if (footer) {
      structure.footer = this.elementToAngularTemplate(footer);
    }

    return structure;
  }

  /**
   * Convert HTML element to Angular template syntax
   */
  private elementToAngularTemplate(element: Element): string {
    let html = element.outerHTML;

    // Convert common patterns to Angular syntax
    html = html.replace(/onclick="([^"]*)"/g, '(click)="$1"');
    html = html.replace(/onchange="([^"]*)"/g, '(change)="$1"');
    html = html.replace(/oninput="([^"]*)"/g, '(input)="$1"');
    
    // Convert data binding patterns
    html = html.replace(/\{\{([^}]+)\}\}/g, '{{$1}}'); // Keep Angular interpolation
    html = html.replace(/data-bind="([^"]*)"/g, '[attr.data-bind]="$1"');
    
    // Convert form elements
    html = html.replace(/<input([^>]*?)value="([^"]*)"([^>]*?)>/g, '<input$1[(ngModel)]="$2"$3>');
    html = html.replace(/<select([^>]*?)>/g, '<select$1 [(ngModel)]="selectedValue">');

    return html;
  }

  /**
   * Extract styles from HTML template
   */
  private extractStyles(element: HTMLElement): string {
    const styleElements = element.querySelectorAll('style, link[rel="stylesheet"]');
    let combinedStyles = '';

    styleElements.forEach(styleEl => {
      if (styleEl.tagName === 'STYLE') {
        combinedStyles += styleEl.textContent + '\n';
      } else if (styleEl.tagName === 'LINK') {
        const href = styleEl.getAttribute('href');
        combinedStyles += `/* External stylesheet: ${href} */\n`;
      }
    });

    return combinedStyles;
  }

  /**
   * Extract scripts from HTML template
   */
  private extractScripts(element: HTMLElement): string {
    const scriptElements = element.querySelectorAll('script');
    let combinedScripts = '';

    scriptElements.forEach(scriptEl => {
      if (scriptEl.textContent) {
        combinedScripts += scriptEl.textContent + '\n';
      } else if (scriptEl.src) {
        combinedScripts += `/* External script: ${scriptEl.src} */\n`;
      }
    });

    return combinedScripts;
  }

  /**
   * Generate predefined template configurations
   */
  getPrebuiltTemplates(): TemplateConfig[] {
    return [
      {
        name: 'Modern Dashboard',
        version: '1.0.0',
        description: 'Clean, modern dashboard with sidebar navigation',
        layout: 'sidebar',
        components: {
          header: true,
          sidebar: true,
          footer: false,
          breadcrumbs: true
        },
        styling: {
          theme: 'light',
          colorScheme: 'blue',
          customVariables: {
            'primary-color': '#2563eb',
            'secondary-color': '#64748b',
            'background-color': '#f8fafc',
            'sidebar-width': '280px',
            'header-height': '64px'
          }
        }
      },
      {
        name: 'Minimalist Admin',
        version: '1.0.0',
        description: 'Minimal design with top navigation',
        layout: 'topbar',
        components: {
          header: true,
          sidebar: false,
          footer: true,
          breadcrumbs: false
        },
        styling: {
          theme: 'light',
          colorScheme: 'gray',
          customVariables: {
            'primary-color': '#374151',
            'secondary-color': '#9ca3af',
            'background-color': '#ffffff',
            'header-height': '72px'
          }
        }
      },
      {
        name: 'Dark Analytics',
        version: '1.0.0',
        description: 'Dark theme analytics dashboard',
        layout: 'hybrid',
        components: {
          header: true,
          sidebar: true,
          footer: false,
          breadcrumbs: true
        },
        styling: {
          theme: 'dark',
          colorScheme: 'purple',
          customVariables: {
            'primary-color': '#8b5cf6',
            'secondary-color': '#6b7280',
            'background-color': '#111827',
            'sidebar-width': '320px',
            'header-height': '60px'
          }
        }
      }
    ];
  }
}

