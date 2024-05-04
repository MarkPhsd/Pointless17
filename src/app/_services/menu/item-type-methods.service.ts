import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import {  Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ItemTypeEditorComponent } from 'src/app/modules/admin/products/item-type/item-type-editor/item-type-editor.component';
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
    private dialog: MatDialog,
    ) { }

  initalizeTypes(): Observable<any> {
    const site     = this.siteService.getAssignedSite()
    return  this.useGroupsService.initGroups(site).pipe(
      switchMap( data => {
        const itemTypes = this.itemTypeService.getDefaultItemTypes();
        return this.itemTypeService.initItemTypes(site, itemTypes)
      })
    )
  }

  notify(message, title, time) {
    this.snackBar.open(message,title, {
      duration: time,
    })
  }

  openItemEditor(id: number) {
    if (id) {
      return  this.dialog.open(ItemTypeEditorComponent,
        { width:        '800px',
          minWidth:     '800px',
          height:       '740px',
          minHeight:    '740px',
          data : {id: id}
        }
      )
    }
    return null
  }


}

