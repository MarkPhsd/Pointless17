import { Component, Inject, OnInit } from '@angular/core';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
              private siteService:  SitesService,
              private productEditButtonService: ProductEditButtonService,
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
      this.itemTypeProducts    = data.filter(items  => items.useType === 'product' || items.useType.toLowerCase() === 'modifier')
      this.itemTypeCategories  = data.filter(items  => items.useType === 'category')
      this.itemTypeAdjustments = data.filter(items  => items.useType === 'adjustment')
    })
  }

  initList() {
    // const site = this.siteService.getAssignedSite();
    // const itemTypes = this.itemTypeService.getDefaultItemTypes();
    // const defaultItemTypes$ = this.itemTypeService.initItemTypes(site, itemTypes);
  }

  addItem(item) {
    // console.log('item', item)
    this.productEditButtonService.addItem(item.id)
  }

  exit() {
    this.dialogRef.close();
  }

}
