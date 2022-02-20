import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DevService {

  constructor() { }

  get devMode(): boolean {
    return isDevMode();
  }

}
