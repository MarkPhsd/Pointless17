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

@Component({
  selector: 'app-inventory-locations',
  templateUrl: './inventory-locations.component.html',
  styleUrls: ['./inventory-locations.component.scss']
})

export class InventoryLocationsComponent implements OnInit, AfterViewInit, OnChanges {

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
  location: IInventoryLocation;

  columnsToDisplay = ['id', 'name', 'activeLocation', 'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: FormBuilder,
            private inventoryLocationsService: InventoryLocationsService,
            private siteService: SitesService,

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
    this.inventoryLocationsService.getLocations().subscribe(
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

    this.inventoryLocationsService.getLocation(id).subscribe(
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
      this.inventoryLocationsService.updateLocation( data.id, data).subscribe(data => {
        // this.notifyEvent(`updated`, `Success` )
        this.refreshTable();
      }, error => {
        // this.notifyEvent(`update ${error} and id: ${data.id}`, `failure` )
      })

    } else {

      this.inventoryLocationsService.addLocation(data).subscribe(data => {
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
      let site$ =  await this.inventoryLocationsService.deleteLocation(this.location.id)
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
