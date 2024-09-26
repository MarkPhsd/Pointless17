// custom.window.d.ts or window.d.ts
declare global {
  interface Window {
    dataLayer: any[];  // To hold Google Analytics dataLayer
    DatacapWebToken: any; // Adjust the type as necessary
    DatacapHostedWebToken: any;
  }

  function gtag(command: 'js' | 'config', target: string | Date, config?: any): void;  // Declare gtag function with proper types
}

export {};  // This file needs to be a module to allow global declarations


