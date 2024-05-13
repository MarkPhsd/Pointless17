import { Component, OnInit, SimpleChange, ViewChild, AfterViewInit , OnChanges, Inject, TemplateRef, ComponentFactoryResolver} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap} from 'rxjs';
import { UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { InventoryLocationsService , IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IPrinterLocation, PrinterLocationsService, IPrinterLocationRO } from 'src/app/_services/menu/printer-locations.service';
import { IItemBasic } from 'src/app/_services';
import { SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-printer-locations',
  templateUrl: './printer-locations.component.html',
  styleUrls: ['./printer-locations.component.scss']
})
export class PrinterLocationsComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('electronPrintingTemplate') electronPrintingTemplate: TemplateRef<any>;
  @ViewChild('electronPrintingDesignTemplate') electronPrintingDesignTemplate: TemplateRef<any>;

  locationForm: UntypedFormGroup;
  action$: Observable<any>;
  locationTable$ : Observable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;
  noData =true
  metrcEnabled: boolean;
  length: number;
  pageSize: number;
  pageSizeOptions: any;

  ccsSite: ISite;
  ccsSites$: Observable<ISite[]>
  ccsSites: ISite[]
  ccsSite$: Observable<ISite>
  imgName: string;
  location = {} as IPrinterLocation;

  columnsToDisplay = ['id', 'name', 'printer', 'templateName', 'address', 'edit'];

  receiptList$    :  Observable<IItemBasic[]>;
  receiptList     : IItemBasic[];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: UntypedFormBuilder,
            private settingService: SettingsService,
            private printerLocationsService: PrinterLocationsService,
            private siteService: SitesService,
  )
  {  }

  ngOnInit(): void {

    this.pageSize = 10
    this.initForm()
    this.receiptList$ = this.refreshAll();
  }

  refreshAll() {
    const receiptList$ = this.getReceiptList();
    return  receiptList$.pipe(
      switchMap( data => {
        return this.getLocations()
      }
    ))
  }

  getReceiptList() {
    const site         = this.siteService.getAssignedSite()
    return this.settingService.getReceipts(site).pipe(switchMap(data => {
      this.receiptList = data;
      return of(data)
    }))
  }

  ngAfterViewInit(){
    this.refreshTable()
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.refreshTable();
  }

  refreshTable(): void {
    this.locationTable$ = this.getLocations()
    this.ccsSite = {} as ISite;
  };

  getLocations(): Observable<IPrinterLocation[]> {
    return this.printerLocationsService.getLocations().pipe(
      switchMap(data => {

          if (!data) { 
            this.noData = true 
            return of(data)
          }

          let list = data as IPrinterLocationRO[];
          this.pageSize = 10
          this.length = data.length
          this.pageSizeOptions = [5, 10]

          list.forEach(item => {
            item.templateName = this.getTemplateName(item)
            console.log(item.templateName);
            return item
          })

          this.dataSource = new MatTableDataSource(list)
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
          return of(data)
        }
      ));
    
  }

  getTemplateName(item: IPrinterLocationRO) {
    let receiptName = ''
    if (this.receiptList) {
      this.receiptList.forEach( receipt => {
        // console.log('item', item.templateID, receipt.name,  receipt.id)
        if (item.templateID === receipt.id) {
          receiptName = receipt.name
          return receipt.name;
        }
      })
    }
    return receiptName
  }

  editItem(id:number) {
    this.initFormData(id)
  }

  get  isElectronPrintingDesignTemplate() {
    return this.electronPrintingDesignTemplate
  }

  initForm() {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      printer: [''],
      templateID: [''],
      id: [''],
      address: [],
    })
    this.locationForm.patchValue(this.location)
    this.imgName = ""
  }

  initFormData(id: number) {
    this.action$ = this.printerLocationsService.getLocation(id).pipe(
      switchMap(data=> {
        this.locationForm.patchValue(data)
        this.location = data
        return of('')
      }
    ))
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
      }
    );
  }

  addLocation() {
    if (!this.locationForm.valid) {
      this.notifyEvent('Form not valid', 'Alert')
    }

    const data = this.locationForm.value
    this.action$ =  this.printerLocationsService.addLocation(data).pipe(
      switchMap(data => {
        this.notifyEvent(`${data.name} Added`, `Success` )
        this.refreshTable();
        return of("")
      })
    )
    this.initForm()
  }

  clearLocation() {
    this.location = null;
    this.initForm()
  }

  delete() {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    if (this.location) {
      this.initForm()
      let site$ =  this.printerLocationsService.deleteLocation(this.location.id)
      this.action$ = site$.pipe(
        switchMap(data=>{
            this.refreshTable();
            return of('')
        })
      );
    }
  }

  updateLocation() {
    const data = this.locationForm.value
    if (data) {
        if (!data.id) { return }
        // this.notifyEvent(`Data ${data.name}`, `Data` )
        data.imgName = this.imgName
        this.action$ = this.printerLocationsService.updateLocation( data.id, data).pipe(
          switchMap(data => {
            this.receiptList$ = this.refreshAll()
            return this.refreshAll()
          })
        )
      }
  }

}
