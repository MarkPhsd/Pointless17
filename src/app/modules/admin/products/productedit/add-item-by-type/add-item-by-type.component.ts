import { Component, Inject, OnInit } from '@angular/core';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-add-item-by-type',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
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
  const site = this.siteService.getAssignedSite();
  const itemTypes$ = this.itemTypeService.getItemTypes(site);

  itemTypes$.subscribe(data => {
    console.log('data', data);

    // Filtering products or modifiers
    this.itemTypeProducts = data.filter(item =>
      item.useType && (this.getItem(item) === 'product' || this.getItem(item) === 'modifier')
    );

    // Filtering groupings
    this.itemTypeCategories = data.filter(item =>
      item.useType && this.getItem(item) === 'category'
    );

    // Filtering adjustments
    this.itemTypeAdjustments = data.filter(item =>
      item.useType && this.getItem(item) === 'adjustment'
    );
  });

  this.sortAlpha(1);
}


  getItem(items) {
    try {
      return items?.useType.toLowerCase()
    } catch (error) {

    }
    return ''
  }

  sortAlpha(index) {
    if (index ==1) {
      this.itemTypeProducts    = this.sortByName(this.itemTypeProducts)
      this.itemTypeCategories  = this.sortByName(this.itemTypeCategories)
      this.itemTypeAdjustments = this.sortByName(this.itemTypeAdjustments)
    }
    if (index == 2) {

    }
    if (index == 3) {

    }
  }

  sortByName(list) {
    if (!list) { return }
    if (list.length == 0 ) { return }

    list.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return list
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
