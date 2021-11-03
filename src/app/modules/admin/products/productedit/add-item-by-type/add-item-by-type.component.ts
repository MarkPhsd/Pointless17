import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IItemBasicB, MenuService } from 'src/app/_services';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemsService } from 'src/app/_services/transactions/items.services';


@Component({
  selector: 'app-add-item-by-type',
  templateUrl: './add-item-by-type.component.html',
  styleUrls: ['./add-item-by-type.component.scss']
})
export class AddItemByTypeComponent implements OnInit {

  itemTypes$:         Observable<IItemType[]>;
  defaultItemTypes$:  Observable<IItemType[]>;
  itemTypes:          IItemType[];
  itemTypeProducts:   IItemType[];
  itemTypeAdjustments:IItemType[];
  itemTypeCategories: IItemType[];

  constructor(private itemTypeService: ItemTypeService,
              private menusService: MenuService,
              private siteService:  SitesService,
              private productEditButtonService: ProductEditButtonService,
              private _snackBar:    MatSnackBar,
              private dialogRef: MatDialogRef<AddItemByTypeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
              ){
  }


// getDefaultItemTypes
// initItemTypes

// getItemTypes

//sort
// putItemTypesList

  ngOnInit() {
    const site         =  this.siteService.getAssignedSite();
    const itemTypes$   =  this.itemTypeService.getItemTypes(site);

    itemTypes$.subscribe(data => {
      this.itemTypeProducts    = data.filter(items  => items.useType === 'product')
      this.itemTypeCategories  = data.filter(items  => items.useType === 'category')
      this.itemTypeAdjustments = data.filter(items  => items.useType === 'adjustment')
    })
  }

  initList() {
    const site = this.siteService.getAssignedSite();
    const itemTypes = this.itemTypeService.getDefaultItemTypes();
    const defaultItemTypes$ = this.itemTypeService.initItemTypes(site, itemTypes);
  }

  addItem(item) {
    console.log('item', item)
    this.productEditButtonService.addItem(item.id)
  }

  exit() {
    this.dialogRef.close();
  }

}
