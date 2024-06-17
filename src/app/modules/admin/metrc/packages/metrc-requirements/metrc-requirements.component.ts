import { Component,  Inject,  Input,  OnInit } from '@angular/core';
import { METRCItemsCategories } from 'src/app/_interfaces/metrcs/items';
import { ActivatedRoute,} from '@angular/router';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import { ConversionsService } from 'src/app/_services/measurement/conversions.service';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'metrc-requirements',
  templateUrl: './metrc-requirements.component.html',
  styleUrls: ['./metrc-requirements.component.scss']
})
export class MetrcRequirementsComponent implements OnInit {

  public inputForm: UntypedFormGroup;
  category$: Observable<METRCItemsCategories>;
  @Input() name: string;

  constructor(
    private metrcItemsCategoriesService: MetrcItemsCategoriesService,
    public fb: UntypedFormBuilder) { 
  }

  ngOnInit() { 
    this.category$ = this.metrcItemsCategoriesService.getCategoryByName(this.name).pipe(switchMap(data => { 
      this.initForm(data)
      return of(data)
    }))
  }

  initForm(data: METRCItemsCategories) { 
    this.inputForm = this.fb.group({ 
      id:                           [],
      name:                         [],
      productCategoryType:          [],
      quantityType:                 [],
      requiresStrain:               [],
      requiresItemBrand:            [],
      requiresAdministrationMethod: [],
      requiresUnitCbdPercent:       [],
      requiresUnitCbdContent:       [],
      requiresUnitCbdContentDose:   [],
      requiresUnitThcPercent:       [],
      requiresUnitThcContent:       [],
      requiresUnitThcContentDose:   [],
      requiresUnitVolume:           [],
      requiresUnitWeight:           [],
      requiresServingSize:          [],
      requiresSupplyDurationDays:   [],
      requiresNumberOfDoses:        [],
      requiresIngredients:          [],
      requiresDescription:          [],
      requiresProductPhotos:        [],
      requiresLabelPhotos:          [],
      requiresPackagingPhotos:      [],
      canContainSeeds:              [],
      canBeRemediated:              [],
      lastModified:                 [],
    })
    this.inputForm.patchValue(data)
    // this.inputForm.disable()
  }
}
