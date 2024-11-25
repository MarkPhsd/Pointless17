import { T } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
// import { ElectronService } from 'ngx-electron';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { DSIEMVSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-dsiemvelectron',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './dsiemvelectron.component.html',
  styleUrls: ['./dsiemvelectron.component.scss']
})
export class DSIEMVElectronComponent implements OnInit {
  amountForm : UntypedFormGroup;
  inputForm  : UntypedFormGroup;
  uiSettings : ISetting;
  uiSettings$: Observable<ISetting>;
  uiISettingJSON = {} as DSIEMVSettings;
  responseMessage: string;
  isElectron: boolean
  pathForm  : UntypedFormGroup;
  responseObject: any;

  dsiSettings$: Observable<any>;
  action$     : Observable<any>;
  deviceName: string;

  pathName = 'default'
  get f() {return this.pathForm.controls}

  constructor(private uISettingsService: UISettingsService,
              private fb                : UntypedFormBuilder,
              private matSnack          : MatSnackBar,
              private settingsService   : SettingsService,
              private siteService       : SitesService,
              private platFormService   : PlatformService,
              // private electronService   : ElectronService
            ) { }

  ngOnInit(): void {

  }

}
