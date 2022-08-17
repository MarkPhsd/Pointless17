import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {  Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SitesService } from '../reporting/sites.service';
import { ItemTypeService } from './item-type.service';
import { UseGroupsService } from './use-groups.service';
@Injectable({
  providedIn: 'root'
})
export class ItemTypeMethodsService {

  constructor(
    private useGroupsService: UseGroupsService,
    private itemTypeService: ItemTypeService,
    private siteService    : SitesService,
    private snackBar      :  MatSnackBar,
    ) { }

  initalizeTypes(): Observable<any> {
    const site     = this.siteService.getAssignedSite()
    return  this.useGroupsService.initGroups(site).pipe(
      switchMap( data => {
        const itemTypes = this.itemTypeService.getDefaultItemTypes();
        return this.itemTypeService.initItemTypes(site, itemTypes);
      })
    )
  }

  notify(message, title, time) {
    this.snackBar.open(message,title, {
      duration: time,
    })
  }

}

