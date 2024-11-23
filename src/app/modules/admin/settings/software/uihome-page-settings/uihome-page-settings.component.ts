import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { StoresService } from 'src/app/_services/system/stores.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { EmailSettingsComponent } from '../../email-settings/email-settings.component';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';
import { ValueFieldsComponent } from '../../../products/productedit/_product-edit-parts/value-fields/value-fields.component';

import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacySliderModule } from '@angular/material/legacy-slider';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyLabel } from '@angular/material/legacy-form-field';
import { MatLegacyProgressSpinner, MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyOptionModule } from '@angular/material/legacy-core';
import { SaveChangesButtonComponent } from 'src/app/shared-ui/save-changes-button/save-changes-button.component';
@Component({
  selector: 'uihome-page-settings',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,ColorPickerModule,SaveChangesButtonComponent,
          UploaderComponent,EmailSettingsComponent,FormSelectListComponent,AppMaterialModule,
          ValueFieldsComponent,MatLegacyProgressSpinnerModule,MatIconModule,MatLegacyOptionModule,
          MatLegacyInputModule,MatLegacySliderModule,MatLegacyCardModule,MatDividerModule],
  templateUrl: './uihome-page-settings.component.html',
  styleUrls: ['./uihome-page-settings.component.scss'],
})
export class UIHomePageSettingsComponent implements OnInit {

  debugSection1:  boolean = true;
  debugSection26: boolean = true
  debugSection25: boolean = true
  debugSection23: boolean = true;
  debugSection22: boolean = true;
  debugSection21: boolean = true;
  debugSection20: boolean = true;

  debugSection10: boolean = true

  debugSection2: boolean = true
  debugSection3: boolean = true
  debugSection4: boolean = true

  debugSection8: boolean = true
  debugSection15: boolean = true


  debugSection0: boolean = true
  debugSection7: boolean = true
  debugSection5: boolean = true
  debugSection6: boolean = true


  backgroundImage: string;
  logoHomePage: string;
  tinyLogo    : string;
  inputForm   : UntypedFormGroup;
  uiSettings  : ISetting;
  uiSettings$ : Observable<ISetting>;
  uiHomePage$ : Observable<any>
  uiHomePage  : UIHomePageSettings;
  saving$     : Observable<any>;
  message     : string;
  showEmailSettings = false;
  stores$       : Observable<any>;
  toolTips = this.labelingService.homePageToolTips;

  constructor(
    private labelingService: LabelingService,
    private settingsService  : SettingsService,
    private storeService     : StoresService,
    private uISettingsService: UISettingsService) { }

  ngOnInit() {

    this.saving$  = null;
    this. uiHomePage$ = this.settingsService.getUIHomePageSettingsNoCache().pipe(
    switchMap(
        data => {
        if (data) {
          this.inputForm = this.uISettingsService.initHomePageForm(this.inputForm)
          if (this.inputForm) {
            this.uiHomePage   = data as UIHomePageSettings
            this.inputForm.patchValue(data)
            this.initializeImages(this.uiHomePage)
          }
        } else {
          this.inputForm = this.uISettingsService.initHomePageForm(this.inputForm);
          this.initializeImages(this.uiHomePage)
          this.initForm(this.uiHomePage);
        }
        return of(this.uiHomePage)
      })),catchError( error => {
        console.log(error  + ' error initializing settings')
        return of(error)
       });
       this.refreshStores()
  }

  refreshStores() {
    this.stores$ = this.storeService.getActiveStores()
  }


  initializeImages(data: UIHomePageSettings) {
    if (!data) {return }
    if (data.backgroundImage) {
      this.backgroundImage = data?.backgroundImage;
    }
    if (data.tinyLogo) {
      this.tinyLogo =  data?.tinyLogo;
    }
    if (data.logoHomePage) {
      this.logoHomePage = data?.logoHomePage;
    }
  }

  initForm(data: UIHomePageSettings) {
    if (this.inputForm) {
      this.inputForm.patchValue(data)
      return
    }
  }

  updateSetting(){
    this.message = ''
    this.saving$ = this.uISettingsService.saveConfig(this.inputForm, 'UIHomePageSettings').pipe(
      switchMap(data => {
        this.uiHomePage = JSON.parse(data.text) as UIHomePageSettings;
        this.message    = 'Saved'
        this.uISettingsService.notify('Saved', 'Success')
        return of(this.uiHomePage)
    }))
  }

  //image data
  received_Image(event) {
    this.backgroundImage = event
    this.inputForm.patchValue({backgroundImage: event})
  };

  received_Logo(event) {
    this.logoHomePage = event
    this.inputForm.patchValue({logoHomePage: event})
  };

  received_TinyLogo(event) {
    this.tinyLogo = event
    this.inputForm.patchValue({tinyLogo: event})

  };

}
