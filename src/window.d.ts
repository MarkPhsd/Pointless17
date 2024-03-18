// custom.window.d.ts
declare global {
  interface Window {
    DatacapWebToken: any; // Adjust the type as necessary
    DatacapHostedWebToken: any;
  }
}

export {}; // This file needs to be a module
