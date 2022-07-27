import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ITerminalSettings,  SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-pos-edit-settings',
  templateUrl: './pos-edit-settings.component.html',
  styleUrls: ['./pos-edit-settings.component.scss']
})
export class PosEditSettingsComponent implements OnInit {

  inputForm: FormGroup;
  setting  : any;
  terminal : ITerminalSettings;
  saving$  : Observable<ISetting>;
  saving   : boolean;

  medOrRecStoreList = [
    {id:0,name:'Any'},  {id:1,name:'Med'},  {id:2,name:'Rec'}
  ]

  constructor(
    private _snackBar      : MatSnackBar,
    private fb             : FormBuilder,
    private sitesService   : SitesService,
    private settingsService: SettingsService,
    public  deviceService  :   DeviceDetectorService,
    private dialogRef      : MatDialogRef<PosEditSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  )
{
  if (data) {
    this.setting = data
    if (!this.setting.text) {
      this.terminal  = {} as ITerminalSettings;
      this.terminal.name = this.setting.name = 'New Terminal'
      this.terminal.enabled = true;
      this.terminal.resetOrdersFilter = true;
      this.terminal.medicalRecSales = 0
      this.initForm()
      return
    }
    if (this.setting.text){
      try {
        this.terminal = JSON.parse(this.setting.text)  as ITerminalSettings;
      } catch (error) {
        this.terminal  = {} as ITerminalSettings;
        this.terminal.name = this.setting.name = 'New Terminal'
        this.terminal.enabled = true;
        this.terminal.resetOrdersFilter = true;
        this.terminal.medicalRecSales = 0
        this.initForm()
      }
    }
  }
}

  ngOnInit(): void {
    this.initForm()
  }

  initForm() {
    this.inputForm = this.fb.group({
      medicalRecSales : [''],
      receiptPrinter  : [],
      labelPrinter    : [],
      labelPrinter2   : [],
      enabled         : [],
      resetOrdersFilter: [],
      name:             [''],
      deviceName      : [],
    })

    if (this.terminal) {
      this.inputForm.patchValue(this.terminal)
    }
  }

  saveTerminalSetting( close: boolean) {
    const site = this.sitesService.getAssignedSite()
    const item = this.inputForm.value as ITerminalSettings;
    const text = JSON.stringify(item);

    this.setting.name = item.name;
    this.setting.text = text;
    this.setting.filter = 421
    this.saving$ = this.settingsService.putSetting(site, this.setting.id, this.setting)
    this.saving = true;
    this.saving$.subscribe(data => {
      if (close) {
        this.onCancel(true);
      }
      this.saving = false
    })
  }

  saveSetting(event) {
    this.saveTerminalSetting(false)
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  updateExit(event) {
    this.saveTerminalSetting(true)
  }

  delete(event) {
    const warn = window.confirm('Are you sure you want to delete this terminal?')
    if (warn) {
      const site = this.sitesService.getAssignedSite()
      this.saving$ = this.settingsService.deleteSetting(site, this.setting.id)
      this.saving = true;
      this.saving$.subscribe(data => {
        this.onCancel(true);
      })
    }
  }
}
