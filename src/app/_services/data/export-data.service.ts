import { Injectable } from '@angular/core';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ExportDataService {
  public  schemas$  = of([
    {id: 1, name: 'Products'},
    {id: 2, name: 'Inventory'},
    {id: 3, name: 'Clients - Vendors'},
    {id: 4, name: 'FH Products'},
    {id: 5, name: 'FH Prices'},
    {id: 6, name: 'FH Inventory'},
    {id: 7, name: 'FH Clients'},
    {id: 8, name: 'FH Vendors'},
    {id: 9, name: 'FH Strains'},
  ])

  constructor() { }
}
