import { Component,  Inject,  OnInit } from '@angular/core';
import { Observable ,switchMap,of  } from 'rxjs';
import { ActivatedRoute,} from '@angular/router';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import { ConversionsService } from 'src/app/_services/measurement/conversions.service';

import {
  METRCItemsCategories,
} from 'src/app/_interfaces/metrcs/items';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-item-categories-edit',
  templateUrl: './item-categories-edit.component.html',
  styleUrls: ['./item-categories-edit.component.scss']
})
export class ItemCategoriesEditComponent implements OnInit {

  id: any;
  action$: Observable<any>
  category$: Observable<METRCItemsCategories>;
  category: METRCItemsCategories;

  public inputForm: UntypedFormGroup;

  constructor(
    private conversionService: ConversionsService,
    private metrcItemsCategoriesService: MetrcItemsCategoriesService,
    public route: ActivatedRoute,
    public fb: UntypedFormBuilder,
    private siteService: SitesService,
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
    this.initCategory()
  }

  initCategory() {
    this.category$ = this.metrcItemsCategoriesService.getCategory(this.id).pipe(
      switchMap(data =>{
        this.category = data
        this.inputForm.patchValue(data)
        return of(data)
      })
    )
  }
  initForm() {
    this.inputForm = this.fb.group({
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

  }

  update(event) {
    window.alert('This feature is not implemented')
  }

  delete(event) {
    // window.alert('This feature is not implemented')
    const site = this.siteService.getAssignedSite()
    this.action$ = this.metrcItemsCategoriesService.deleteMetrcCategory(site, this.id).pipe(switchMap(data => { 
      this.dialogRef.close(true)
      // this.siteService.notify("Deleted please referesh")
      return of(data)
    }))
  }

  cancel(event) {
    this.dialogRef.close();
  }

}

