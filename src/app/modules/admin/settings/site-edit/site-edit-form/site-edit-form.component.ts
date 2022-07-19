import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-site-edit-form',
  templateUrl: './site-edit-form.component.html',
  styleUrls: ['./site-edit-form.component.scss']
})
export class SiteEditFormComponent implements OnInit {

  ccsSite: ISite;
  ccsSite$: Observable<ISite>
  imgName: string;
  id: number;
  metrcEnabled = true;

  sitesForm: FormGroup;

  constructor(
    private _snackBar   : MatSnackBar,
    private fb          : FormBuilder,
    private sitesService: SitesService,
    private dialogRef   : MatDialogRef<SiteEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  )
  {
    if (data) {
      this.id = data
      const site = this.sitesService.getAssignedSite();
      this.initFormData(data)
    }
  }

  ngOnInit(): void {
    this.initForm()
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
    })
    this.imgName = ""
  }

  initFormData(id: number) {
    this.sitesService.getSite(id).subscribe(
      data=> {
        this.sitesForm.patchValue(data)
        this.ccsSite = data
        this.imgName = data.imgName
      }, err => {
        console.log(err)
      }
    )
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteCurrentSite(event) {
    const confirm = window.confirm('Are you sure you want to delete this site?')
    if (confirm) {
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
    }
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
        this.sitesService.updateSite(data.id, data).subscribe(data => {
        this.notifyEvent(`updated`, `Success` )
      }, error => {
        this.notifyEvent(`update ${error}`, `failure` )
      })
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
