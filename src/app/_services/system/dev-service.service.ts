import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DevService {

  constructor() { }

  public getdevMode(): boolean {
    return false;
  }
}
