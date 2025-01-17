import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { Observable,switchMap,of, catchError } from 'rxjs';
import { ExportDataService } from 'src/app/_services/data/export-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';

@Component({
  selector: 'app-export-data',
  standalone: true,
  imports: [CommonModule,FormSelectListComponent,MatLegacyProgressSpinnerModule,
            MatLegacyCardModule,
            FormsModule,ReactiveFormsModule,MatLegacyFormFieldModule,MatIconModule,
          ],
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent implements OnInit {
  inputForm   : UntypedFormGroup;
  name: string;
  schemaValue: any;
  exporting$: Observable<any>;
  exporting : boolean;
  message   = ''
  schema$: Observable<any>;
  constructor(
    private fb: UntypedFormBuilder,
    private siteService: SitesService,
    public exportDataService: ExportDataService) { }

  ngOnInit(): void {
    const i = 0;
    this.inputForm = this.fb.group({
      id: [],
      name: [],
    })

    this.schema$ = this.exportDataService. exportSchema$
  }

  selectSchema(event) {
    this.schemaValue = event;
    return;
  }

  initDownload() {
    this.message = ''
    this.exporting = false;
  }

  export() {
    this.exporting$ = this._export()
  }

  _export() {
    this.initDownload();
    const schemaValue = this.schemaValue;
    console.log('inventory values', schemaValue);

    if (schemaValue == 10 || schemaValue == 2) {
      this.exporting = true;
      const site = this.siteService.getAssignedSite();
      const invValues$ = this.exportDataService.listProductValues(site);

      const item$ = invValues$.pipe(
        switchMap( data => {
          this.exporting = false;
          this.message = 'CSV downloaded.'
          this.exportDataService.downloadFile(data, 'Inventory List')
          return of('succeed')
        }
        ),
        catchError( err => {
          this.siteService.notify(`Error : ${err}`, 'Alert' , 2000)
          return of('failed')
        })
      )

      return item$
    }

    if (schemaValue == 12) {
      const site = this.siteService.getAssignedSite();

      const invValues$ = this.exportDataService.listDepartmentValues(site);

      const item$ = invValues$.pipe(
        switchMap( data => {
          this.exporting = false;
          this.message = 'CSV downloaded.'
          this.exportDataService.downloadFile(data, 'Department Count List')
          return of('succeed')
        }
      ),
        catchError( err => {
          this.siteService.notify(`Error : ${err}`, 'Alert' , 2000)
          return of('failed')
        })
      )

      return item$
    }

    if (schemaValue == 13) {
      const site = this.siteService.getAssignedSite();

      const invValues$ = this.exportDataService.listCategoryValues(site);

      const item$ = invValues$.pipe(
        switchMap( data => {
          this.exporting = false;
          this.message = 'CSV downloaded.'
          this.exportDataService.downloadFile(data, 'Category Count List')
          return of('succeed')
        }
      ),
        catchError( err => {
          this.siteService.notify(`Error : ${err}`, 'Alert' , 2000)
          return of('failed')
        })
      )

      return item$
    }

    if (schemaValue == 11) {
      // this.exportDataService.listInventoryValues();
    }

    if (schemaValue == 3) {

    }

    if (schemaValue == 4) {

    }

    return null;
  }



}
