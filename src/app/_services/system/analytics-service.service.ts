import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private trackingId: string = '';

  constructor(private httpClient: HttpClient) {}

// const config$ =  this.httpClient.get('assets/app-config.json').pipe(switchMap(data => {

  initializeTracking(domain: string): void {
    // Set your tracking ID based on domain
    switch(domain) {
      case 'example1.com':
        this.trackingId = 'UA-XXXXX-Y';
        break;
      case 'example2.com':
        this.trackingId = 'UA-XXXXX-Z';
        break;
      default:
        this.trackingId = 'UA-DEFAULT-ID';
        break;
    }
    this.loadAnalyticsScript(this.trackingId);
  }

  private loadAnalyticsScript(trackingId: string): void {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(command: string, eventName: string | Date, options?: any) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', trackingId);
  }
}
