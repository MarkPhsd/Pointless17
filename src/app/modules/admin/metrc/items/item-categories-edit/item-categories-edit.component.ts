import { Component,  Inject,  OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable  } from 'rxjs';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ActivatedRoute, Router } from '@angular/router';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { AWSBucketService  } from 'src/app/_services';
import { tap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup} from '@angular/forms';
import { ConversionsService } from 'src/app/_services/measurement/conversions.service';

import {
  METRCItems,
  METRCItemsCategories,
  MetrcItemsBrands,
  METRCItemsCreate,
  METRCItemsUpdate
} from 'src/app/_interfaces/metrcs/items';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';

@Component({
  selector: 'app-item-categories-edit',
  templateUrl: './item-categories-edit.component.html',
  styleUrls: ['./item-categories-edit.component.scss']
})
export class ItemCategoriesEditComponent implements OnInit {

  id: any;

  category$: Observable<METRCItemsCategories>;
  category: METRCItemsCategories;

  public categoryForm: FormGroup;

  constructor(
    private conversionService: ConversionsService,
    private metrcItemsCategoriesService: MetrcItemsCategoriesService,
    private router: Router,
    public route: ActivatedRoute,
    public fb: FormBuilder,
    private sanitizer : DomSanitizer,
    private awsBucket: AWSBucketService,
    private _snackBar: MatSnackBar,
    private menuPricingService: PriceCategoriesService,
    private taxes: TaxesService,
    private dialogRef: MatDialogRef<METRCItemsCategories>,
    @Inject(MAT_DIALOG_DATA) public data: any
    )
  {

    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

  }

  ngOnInit() {

    this.initForm();

  }

  initForm() {
    this.categoryForm = this.fb.group({
        id:                           [''],
        name:                         [''],
        productCategoryType:          [''],
        quantityType:                 [''],
        requiresStrain:               [''],
        requiresItemBrand:            [''],
        requiresAdministrationMethod: [''],
        requiresUnitCbdPercent:       [''],
        requiresUnitCbdContent:       [''],
        requiresUnitCbdContentDose:   [''],
        requiresUnitThcPercent:       [''],
        requiresUnitThcContent:       [''],
        requiresUnitThcContentDose:   [''],
        requiresUnitVolume:           [''],
        requiresUnitWeight:           [''],
        requiresServingSize:          [''],
        requiresSupplyDurationDays:   [''],
        requiresNumberOfDoses:        [''],
        requiresIngredients:          [''],
        requiresDescription:          [''],
        requiresProductPhotos:        [''],
        requiresLabelPhotos:          [''],
        requiresPackagingPhotos:      [''],
        canContainSeeds:              [''],
        canBeRemediated:              [''],
        lastModified:                 [''],
    })

    this.category = {} as METRCItemsCategories;

    try {
      this.category$ = this.metrcItemsCategoriesService.getCategory(this.id).pipe(
        tap(data => this.categoryForm.patchValue(data))
      );
    } catch (error) {
      console.log(error)
    }
  }

  update(event) {
    window.alert('This feature is not implemented')
  }

  delete(event) {
    window.alert('This feature is not implemented')
  }

  cancel(event) {
    this.dialogRef.close();
  }

}

