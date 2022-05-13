import { Injectable } from '@angular/core';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ExportDataService {
  public schemas$  = of([
    {id: 1, name: 'Products'},
    {id: 2, name: 'Inventory'},
    {id: 3, name: 'Clients - Vendors'},
  ])

  constructor() { }
}
