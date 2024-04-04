import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationHistoryService {
  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        this.history.push(urlAfterRedirects);
      });
  }

  // Get the last route
  public getLastRoute(): string {
    return this.history.length > 1 ? this.history[this.history.length - 2] : '/';
  }

  // Method to manually add routes to history (if needed)
  public addToHistory(url: string): void {
    this.history.push(url);
  }

  // Clear history
  public clearHistory(): void {
    this.history = [];
  }
}
