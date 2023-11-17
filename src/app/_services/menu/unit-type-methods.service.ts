import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from '../reporting/sites.service';
import { SearchModel } from '../system/paging.service';
import { ProductEditButtonService } from './product-edit-button.service';
import { UnitTypesService } from './unit-types.service';

@Injectable({
  providedIn: 'root'
})
export class UnitTypeMethodsService {

  constructor(private productEditButtonService: ProductEditButtonService,
              private unitTypeService: UnitTypesService,
              private siteService: SitesService,
              ) { }

  openUnitEditorOBS(id: number): Observable<any> {

    const site = this.siteService.getAssignedSite();
    const search = {id: id} as SearchModel;
    const item$ = this.unitTypeService.getUnitTypesSearch(site, search);

    const dialog$ =  item$.pipe(switchMap( data => {
      let item
      if (data && data.results && data.results[0]) {
         item = data.results[0]
      }
      return this.productEditButtonService.openUnitTypeEditor(item).afterClosed().pipe(switchMap(data => {
        // console.log('closing dialog')
        return of(true)
      }))
    }))
    return dialog$
  }
}
