import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { PB_Main, PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-part-builder-edit',
  templateUrl: './part-builder-edit.component.html',
  styleUrls: ['./part-builder-edit.component.scss']
})
export class PartBuilderEditComponent implements OnInit {

  action$ : Observable<PB_Main>;
  pb_Main: PB_Main;
  pb_Main$ : Observable<PB_Main>;
  inputForm: FormGroup;

  site = this.siteService.getAssignedSite()
  id: number;
  constructor(private siteService: SitesService,
              private fb: FormBuilder,
              public route: ActivatedRoute,
              private partBuilderMainService: PartBuilderMainService,
              @Inject(MAT_DIALOG_DATA) public data: any) {

      this.initForm()
      if (data) {
        this.initFormData(data)
      } else {
        this.id = +this.route.snapshot.paramMap.get('id');
        this.pb_Main$ = this.partBuilderMainService.getItem(this.site, +this.id).pipe(switchMap(data => {
            this.initFormData(data)
            return of(data)
          }
        ))
      }
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

}

