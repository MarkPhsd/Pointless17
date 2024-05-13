import { Component, OnInit,  ViewChild } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable} from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { SiteEditFormComponent } from './site-edit-form/site-edit-form.component';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.scss']
})

export class SiteEditComponent implements OnInit {

  sitesForm: UntypedFormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource              : any;
  id                      : number;

  metrcEnabled            : boolean;
  length                  : number;
  pageSize                : number;
  pageSizeOptions         : any;

  ccsSite                 : ISite;
  ccsSites$               : Observable<ISite[]>
  ccsSites                : ISite[]
  ccsSite$                : Observable<ISite>

  columnsToDisplay = ['name', 'url', 'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb          : UntypedFormBuilder,
            private sitesService: SitesService,
            private dialog      : MatDialog,
  )
  {  }

  ngOnInit(): void {
    this.metrcEnabled = true
    this.pageSize = 10
    this.refreshTable();
  }

  refreshTable(): void {
    this.sitesService.getSites().subscribe(
      data => {
          this.pageSize = 10
          this.length = data.length
          this.pageSizeOptions = [5, 10]
          this.dataSource = new MatTableDataSource(data)
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            console.log("Paginator set")
          }
        },
        error => {
          // this.notifyEvent("Error, see console for details.", "Error")
          console.log("refreshTable", error)
        }
      );
      this.ccsSite = {} as ISite;
  };

  editItem(id:number): Observable<typeof dialogRef> {
    let dialogRef: any;
    const site = this.sitesService.getAssignedSite();
    dialogRef = this.dialog.open(SiteEditFormComponent,
      { width:        '800px',
        minWidth:     '800px',
        height:       '650px',
        minHeight:    '650px',
        data   : id
      },
    )
    return dialogRef;
  }

  getLabel(rowData)  {
    console.log(rowData);
    return 'Edit';
  }

}
