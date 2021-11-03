import { Component, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable} from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.scss']
})

export class SiteEditComponent implements OnInit {

  sitesForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;

  metrcEnabled: boolean;
  length: number;
  pageSize: number;
  pageSizeOptions: any;

  ccsSite: ISite;
  ccsSites$: Observable<ISite[]>
  ccsSites: ISite[]
  ccsSite$: Observable<ISite>
  imgName: string;

  columnsToDisplay = ['name', 'url', 'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: FormBuilder,
            private sitesService: SitesService
  )
  {  }

  ngOnInit(): void {
    this.metrcEnabled = true
    this.pageSize = 10
    this.initForm()
    this.refreshTable();
  }

  ngAfterViewInit(){
    this.refreshTable()
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
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
          this.notifyEvent("Error, see console for details.", "Error")
          console.log("refreshTable", error)
        }
      );
      this.ccsSite = {} as ISite;
  };

  editItem(id:number) {
    this.initFormData(id)
  }

  initForm() {
    this.sitesForm = this.fb.group({
      name: ['', Validators.required],
      url: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      metrcURL: [''],
      metrcLicenseNumber: [''],
      metrcUser: [''],
      metrcKey: [''],
      id: [''],
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

  getLabel(rowData)  {
    console.log(rowData);
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  updateSite() {
    if (this.sitesForm.valid) {
      this.applyChanges(this.sitesForm.value)
    };
  }

  applyChanges(data) {
    if (data.id) {
      data.imgName = this.imgName
      this.sitesService.updateSite(data.id, data).subscribe(data => {
        this.notifyEvent(`updated`, `Success` )
        this.refreshTable();
      }, error => {
        this.notifyEvent(`update ${error}`, `failure` )
      })

    } else {
      this.sitesService.addSite(data).subscribe(data => {
        this.notifyEvent(`${data.name} Added`, `Success` )
        this.refreshTable();
       }, error => {
        this.notifyEvent(`error ${error}`, `failure` )
      })
    }

    this.initForm()
  }

  async deleteCurrentSite() {

    if (this.ccsSite) {
      const id = this.ccsSite.id
      this.initForm()
      let site$ =  await this.sitesService.deleteSite(id)
      site$.subscribe(data=>{
        this.refreshTable();
        this.notifyEvent("site deleted", "Deleted")
      }, err => {
        this.notifyEvent("Error deleting: " + err, "Error")
      })
    }

  }

  //image data
  received_URLMainImage($event) {
     this.imgName =  $event
     this.updateSite();
  };

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
