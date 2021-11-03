import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from 'src/app/_services';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-item-type-sort',
  templateUrl: './item-type-sort.component.html',
  styleUrls: ['./item-type-sort.component.scss']
})
export class ItemTypeSortComponent implements OnInit {

  itemTypes$:         Observable<IItemType[]>;
  defaultItemTypes$:  Observable<IItemType[]>;
  itemTypes:  IItemType[];

  constructor(private itemTypeService: ItemTypeService,
              private menusService: MenuService,
              private siteService:  SitesService,
              private _snackBar:    MatSnackBar){
  }


// getDefaultItemTypes
// initItemTypes

// getItemTypes

//sort
// putItemTypesList

  ngOnInit() {
    const site =        this.siteService.getAssignedSite();
    this.itemTypes$  =  this.itemTypeService.getItemTypes(site);

    this.itemTypes$.subscribe( data => {
      this.itemTypes = data
    })

  }

  initList() {

    const site = this.siteService.getAssignedSite();
    const itemTypes = this.itemTypeService.getDefaultItemTypes();
    const defaultItemTypes$ = this.itemTypeService.initItemTypes(site, itemTypes);

  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.itemTypes, event.previousIndex, event.currentIndex);
    this.saveMenu()
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.itemTypes) {
      this.itemTypeService.putItemTypesList(site, this.itemTypes).subscribe( data=> {
        console.log(this.itemTypes)
      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  assignType(id: number) {

  }


}
