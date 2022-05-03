import { Component, OnInit, SimpleChange, ViewChild, AfterViewInit , OnChanges, Inject} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable} from 'rxjs';
import { FormBuilder,  FormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { InventoryLocationsService , IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManifestType, ManifestTypesService } from 'src/app/_services/inventory/manifest-types.service';

@Component({
  selector: 'app-manifest-type',
  templateUrl: './manifest-type.component.html',
  styleUrls: ['./manifest-type.component.scss']
})
export class ManifestTypeComponent implements OnInit {

  locationForm: FormGroup;

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
  location: ManifestType;

  columnsToDisplay = ['id', 'name', 'activeLocation', 'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: FormBuilder,
            private inventoryLocationsService: ManifestTypesService,
            private siteService: SitesService,

  )
  {  }

  ngOnInit(): void {
    this.metrcEnabled = true
    this.pageSize = 10
    this.initForm()
    this.refreshTable();
  }

  // ngAfterViewInit(){
  //   this.refreshTable()
  // }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.refreshTable();
  }

  refreshTable(): void {
    this.inventoryLocationsService.listAll().subscribe(
      data => {
          this.pageSize = 10
          this.length = data.length
          this.pageSizeOptions = [5, 10]
          this.dataSource = new MatTableDataSource(data)
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

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
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      activeLocation: [false],
      id: [''],
    })
    this.imgName = ""
  }

  initFormData(id: number) {

    this.inventoryLocationsService.get(id).subscribe(
      data=> {
        this.locationForm.patchValue(data)
        this.location = data
      }, err => {
        console.log(err)
      }
    )
  }

  update() {
    if (this.locationForm.valid) {
      this.applyChanges(this.locationForm.value)
    };
  }

  applyChanges(data) {
    if (data.id) {
      this.notifyEvent(`Data ${data}`, ` Data` )
      data.imgName = this.imgName
      this.inventoryLocationsService.update( data.id, data).subscribe(data => {
        // this.notifyEvent(`updated`, `Success` )
        this.refreshTable();
      }, error => {
        // this.notifyEvent(`update ${error} and id: ${data.id}`, `failure` )
      })

    } else {

      this.inventoryLocationsService.add(data).subscribe(data => {
        // this.notifyEvent(`${data.name} Added`, `Success` )
        this.refreshTable();
       }, error => {
        this.notifyEvent(`error ${error}`, `failure` )
      })
    }

    this.initForm()
  }

  async delete() {

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }

    if (this.location) {
      this.initForm()
      let site$ =  await this.inventoryLocationsService.delete(this.location.id)
      site$.subscribe(data=>{
        this.refreshTable();
        // this.notifyEvent("site deleted", "Deleted")
      }, err => {
        this.notifyEvent("Error deleting: " + err, "Error")
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
