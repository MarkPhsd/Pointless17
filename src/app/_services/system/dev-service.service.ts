import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DevService {

  constructor() { }

  getdevMode(): boolean {
    return false;
  }

}
