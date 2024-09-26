import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
interface AppConfig {
  apiUrl: string;
  useAppGate: boolean;
  appGateMessage: string;
  company: string;
  logo: string;
  appUrl: string;
  gTag: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: AppConfig;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<any> {
    return this.http
      .get<AppConfig>('assets/app-config.json')
      .toPromise()
      .then((config) => {
        this.config = config;
        this.initializeGtag();
      })
      .catch((error) => {
        console.error('Could not load app-config.json', error);
      });
  }

  getConfig(): AppConfig {
    return this.config;
  }

  private initializeGtag(): void {
    const trackingId = this.config.gTag;
    if (trackingId) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      // function gtag() {
      //   window.dataLayer.push(arguments);
      // }

          // Call the global gtag function directly (no redeclaration)
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', trackingId);
    }
  }
}
