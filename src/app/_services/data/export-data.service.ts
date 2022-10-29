import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { saveAs } from 'file-saver';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { MenuService } from '../menu/menu.service';
import { ISite } from 'src/app/_interfaces';
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
    {id: 10, name: 'Products Counts - Export only'},
    {id: 11, name: 'Inventory Counts - Export only'},
    {id: 12, name: 'Department Counts - Export only'},
    {id: 13, name: 'Category Counts - Export only'},
  ])

  constructor( private menuService: MenuService) { }

  downloadFile(data: any, name: string) {
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    var blob = new Blob([csvArray], {type: 'text/csv' })
    saveAs(blob, `${name}.csv`);
  }

  listInventoryValues() {

  }

  listProducts() {

  }

  listProductValues(site: ISite) {
    return this.menuService.getInventoryValues(site)
  }

  listCategoryValues(site: ISite) {
    return this.menuService.getCategoryValues(site)
  }
  listDepartmentValues(site: ISite) {
    return this.menuService.getDepartmentValues(site)
  }

  listContacts() {

  }

  listStrains() {

  }
}
