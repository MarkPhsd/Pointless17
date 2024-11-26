import { Component,  Inject,  Input,  OnInit } from '@angular/core';
import { METRCItemsCategories } from 'src/app/_interfaces/metrcs/items';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'metrc-requirements',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
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
