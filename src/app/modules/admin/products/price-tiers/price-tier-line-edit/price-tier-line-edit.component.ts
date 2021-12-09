import { Component,  Inject,  Input, Output, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable,  } from 'rxjs';
import { IItemBasic } from 'src/app/_services';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPriceCategories, IPriceCategory2,
          IUnitTypePaged,
          ProductPrice, ProductPrice2, UnitTypeSearchModel } from 'src/app/_interfaces/menu/price-categories';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { FbPriceCategoriesService } from 'src/app/_form-builder/fb-price-categories';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { PriceCategoryItemService } from 'src/app/_services/menu/price-category-item.service';
import { PriceCategories } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'app-price-tier-line-edit',
  templateUrl: './price-tier-line-edit.component.html',
  styleUrls: ['./price-tier-line-edit.component.scss']
})
export class PriceTierLineEditComponent implements OnInit {
  inputForm               : FormGroup;
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
