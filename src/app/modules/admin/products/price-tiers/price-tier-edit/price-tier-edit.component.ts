import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbPriceCategoriesService } from 'src/app/_form-builder/fb-price-categories';
import { IPriceCategories, UnitTypeSearchModel } from 'src/app/_interfaces/menu/price-categories';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { PriceCategoryItemService } from 'src/app/_services/menu/price-category-item.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PriceCategoriesEditComponent } from '../../pricing/price-categories-edit/price-categories-edit.component';

@Component({
  selector: 'app-price-tier-edit',
  templateUrl: './price-tier-edit.component.html',
  styleUrls: ['./price-tier-edit.component.scss']
})
export class PriceTierEditComponent implements OnInit {
  inputForm               : FormGroup;
  constructor(  private _snackBar   : MatSnackBar,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private priceCategoryService    : PriceCategoriesService,
    private priceCategoryItemService: PriceCategoryItemService,
    private fbPriceCategory         : FbPriceCategoriesService,
    private dialogRef: MatDialogRef<PriceCategoriesEditComponent>,
    private unitTypeService: UnitTypesService,
    @Inject(MAT_DIALOG_DATA) public data: IPriceCategories
    )
  {
    if (data) {

    }
    const site          = this.siteService.getAssignedSite()

    let unitSearchModel = {} as UnitTypeSearchModel;
    unitSearchModel.pageNumber = 1;
    unitSearchModel.pageSize   = 1000;

    const search$ = this.unitTypeService.getBasicTypes(site, unitSearchModel)
    search$.subscribe(data => {
      this.unitTypes = data.results;
     // console.log('init sizes', data.results)
    })
    this.unitTypes$ = this.unitTypeService.getBasicTypes(site, unitSearchModel);
    this.refreshData_Sub(this.priceCategory);
  }

  ngOnInit(): void {
    console.log('')
  }

}
