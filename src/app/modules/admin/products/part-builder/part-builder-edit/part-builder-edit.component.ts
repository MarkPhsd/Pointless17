import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, catchError, of, switchMap } from 'rxjs';
import { PartBuilderMainMethodsService } from 'src/app/_services/partbuilder/part-builder-main-methods.service';
import { PB_Main, PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-part-builder-edit',
  templateUrl: './part-builder-edit.component.html',
  styleUrls: ['./part-builder-edit.component.scss']
})
export class PartBuilderEditComponent implements OnInit {

  itemChanged: boolean;
  action$   : Observable<PB_Main>;
  pb_Main  : PB_Main;
  pb_Main$ : Observable<PB_Main>;
  inputForm: FormGroup;
  _pb_Main : Subscription;

  site = this.siteService.getAssignedSite()
  id: number;
  initPBMainSubscription() {
   this._pb_Main = this.partBuilderMainMethods.PB_Main$.subscribe(data => {
      this.pb_Main = data;
   })
  }

  constructor(private siteService: SitesService,
              private fb: FormBuilder,
              public route: ActivatedRoute,
              private router: Router,
              private partBuilderMainMethods: PartBuilderMainMethodsService,
              private partBuilderMainService: PartBuilderMainService,
              private dialogRef: MatDialogRef<PartBuilderEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.initForm()

    if (data && data.id) {
      this.initFormData(data)
      this.partBuilderMainMethods.updatePBMain(data)
    } else {
      this.id = +this.route.snapshot.paramMap.get('id');
      if (this.id) {
        this.refreshForm(this.id)
      }
    }
    this.initPBMainSubscription();
  }

  refreshForm(id) {
      this.pb_Main$ = this.partBuilderMainService.getItem(this.site, +this.id).pipe(switchMap(data => {
        this.setData(data)
        return of(data)
      }
    ))
  }

  setData(data) {
    this.pb_Main = data;
    this.id = data.id;
    this.initFormData(data)
    this.partBuilderMainMethods.updatePBMain(data)
    this.itemChanged = true;
  }

  ngOnInit(): void {
    const i = 0;
  }

  initFormData(data: PB_Main) {
    if (this.inputForm) {
      this.inputForm.patchValue(data)
    }
  }

  initForm() {
    this.inputForm = this.fb.group({
      id: [''],
      name: [''],
      sort: [''],
      dateUpdated: ['']
    });
  }

  updateSave(event) {
    this.save(false)
  }

  updateItemExit(event ){
    this.save(true)
  }

  save(close) {
    const site = this.siteService.getAssignedSite()
    if (!this.pb_Main) { return }
    if (this.pb_Main) {
      console.log(this.pb_Main.pB_Components)
      this.pb_Main.name = this.inputForm.controls['name'].value;
      if (this.id) {
        this.pb_Main.id = this.id;
      }
      this.action$ = this.partBuilderMainService.save(site, this.pb_Main).pipe(
        switchMap(data => {
          try {
            this.setData(data)
            this.siteService.notify('Saved', 'close', 1000, 'green')
          } catch (error) {

          }
          return of(data)
      }), catchError(data => {
        this.siteService.notify('Error' + data.toString, 'close', 1000, 'red')
        return of(data)
      }))
    }
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    const confirm = window.confirm('Are you sure you want to delete this item?')
    if (!this.pb_Main) { return }
    if (!confirm) {return}
    this.action$ = this.partBuilderMainService.delete(site, this.pb_Main.id).pipe(
      switchMap(data => {
        this.itemChanged = true;
        this.siteService.notify('Saved', 'close', 1000, 'green')
        return of(data)
      }), catchError(data => {
        this.siteService.notify('Error' + data.toString, 'close', 1000, 'red')
        return of(data)
    }))
  }

  onCancel(event) {
    let result = false
    console.log('on cancel')
    this.router.navigate(['part-builder-list'])
    if (this.itemChanged) {result = true}
  }

  copyItem(event) {

  }

}

