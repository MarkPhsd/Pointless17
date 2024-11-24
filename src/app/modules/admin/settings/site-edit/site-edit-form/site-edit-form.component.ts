import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { store, StoresService } from 'src/app/_services/system/stores.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';

@Component({
  selector: 'app-site-edit-form',
  standalone:true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,UploaderComponent,EditButtonsStandardComponent,FormSelectListComponent],
  templateUrl: './site-edit-form.component.html',
  styleUrls: ['./site-edit-form.component.scss']
})
export class SiteEditFormComponent implements OnInit {

  ccsSite: ISite;
  ccsSite$: Observable<ISite>
  imgName: string;
  id: number;
  metrcEnabled = true;

  sitesForm: UntypedFormGroup;
  stores$ : Observable<store[]>;

  constructor(
    private _snackBar   : MatSnackBar,
    private fb          : UntypedFormBuilder,
    private sitesService: SitesService,
    private storeService: StoresService,
    private dialogRef   : MatDialogRef<SiteEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  )
  {
    if (data) {
      this.id = data
      this.ccsSite$ = this.sitesService.getSite(+data).pipe(switchMap(item => {
        console.log('data', data, item)
        this.initForm()
        this._initForm(item)
        return of(item)
      }))
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.refreshStores()
  }

  refreshStores() {
    this.stores$ = this.storeService.getStores()
  }

  initForm() {
    this.sitesForm = this.fb.group({
      name              : ['', Validators.required],
      url               : ['', Validators.required],
      city              : ['', Validators.required],
      address           : ['', Validators.required],
      state             : ['', Validators.required],
      zip               : ['', Validators.required],
      phone             : ['', Validators.required],
      metrcURL          : [''],
      metrcLicenseNumber: [''],
      metrcUser         : [''],
      metrcKey          : [''],
      id                : [''],
      storeID           : [''],
    })
    this.imgName = ""
  }

  initFormData(id: number) {
    this.sitesService.getSite(id).subscribe(
      data => {
        this._initForm(data)
      }
    )
  }

  _initForm(data: ISite) {
    this.sitesForm.patchValue(data)
    this.ccsSite = data
    this.imgName = data?.imgName
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteCurrentSite(event) {
    // const confirm = window.confirm('Are you sure you want to delete this site?')
    // if (confirm) {
      if (this.ccsSite) {
        const id = this.ccsSite.id
        this.initForm()
        const site$ =  this.sitesService.deleteSite(id)
        site$.subscribe(
          {next: data => {
              this.notifyEvent("site deleted", "Deleted")
            }, error : err => {
              this.notifyEvent("Error deleting: " + err, "Error")
            }
          }
        )
      }
    // }
  }

  //image data
  received_URLMainImage(event) {
    this.imgName =  event
    this.updateSite(null);
  };

  updateSite(event) {
    if (!this.sitesForm.valid) {
      this.notifyEvent(`Please complete form.`, `oops!` )
      return
    }
    if (this.sitesForm.valid) {
      this.applyChanges(this.sitesForm.value)
    };
  }

  updateExit(event){
    if (!this.sitesForm.valid) {
      this.notifyEvent(`Please complete form.`, `oops!` )
      return
    }
    if (this.sitesForm.valid) {
      this.applyChanges(this.sitesForm.value)
      this.onCancel(null)
    };
  }

  applyChanges(data) {
    if (data.id) {
        data.imgName = this.imgName
        this.sitesService.updateSite(data.id, data).subscribe(
          {
          next: data => {
              this.notifyEvent(`updated`, `Success` )
            },
          error: error => {
              this.notifyEvent(`update ${error}`, `failure` )
          }
        }
       )
    } else {
      this.sitesService.addSite(data).subscribe(
      {
        next: data => {
          this.notifyEvent(`${data.name} Added`, `Success` )
        },
        error: error => {
          this.notifyEvent(`error ${error}`, `failure` )
        }
      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
