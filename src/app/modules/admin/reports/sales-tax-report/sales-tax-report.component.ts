import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit,Output,ViewChild } from '@angular/core';
import { catchError, Observable, of, Subject, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import {  EmployeeClockSearchModel, EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IReportingSearchModel,  ITaxReport, ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'sales-tax-report',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './sales-tax-report.component.html',
  styleUrls: ['./sales-tax-report.component.scss']
})
export class SalesTaxReportComponent implements OnInit, OnChanges {

  @ViewChild('canvas')       canvas: ElementRef;
  @ViewChild('printsection') printsection: ElementRef;

  @Input() summaryOnly: boolean;
  //[site]="site" [dateFrom]="dateFrom" [dateTo]="dateTo"   [notifier]="childNotifier"
  @Input() site: ISite;

  @Input() dateTo: string;
  @Input() dateFrom: string;
  @Input() zrunID  : string;

  @Input() employeeID: number;
  @Input() scheduleDateStart: string;
  @Input() scheduleDateEnd: string;
  // scheduleDateStart       :     string;
  // scheduleDateEnd         :     string;
  @Input() notifier: Subject<boolean>
  @Input() minimized: boolean;
  @Input() pendingTransactions: boolean;
  sales: ITaxReport;
  sales$ : Observable<ITaxReport>;
  laborSummary$: Observable<EmployeeClock>;
  laborSummary = {} as EmployeeClock;

  @Input() styles: string;
  @Input() printerName: string;
  printAction$: Observable<any>;
  printing: boolean;

  @Input() disableDiscounts: boolean;
  @Input() disableOther: boolean;
  @Input() disableTaxBreakDown: boolean;
  @Input() disableCOSG: boolean;
  @Input() disableLabor: boolean;

  @Output() outputComplete = new EventEmitter<any>()

  constructor(
    private popOutService: ProductEditButtonService,
    private employeeClockService: EmployeeClockService,
    private siteService               : SitesService,
    private reportingItemsSalesService: ReportingItemsSalesService,
    public platFormService: PlatformService,
    private printingService: PrintingService,
    private httpClient: HttpClient,
    ) { }
  processing: boolean;

  ngOnInit(): void {
    // this.refreshSales()
    // console.log('')
    const i = 0
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {
    this.processing = true;
    this.laborSummary$ = this.getLaborSummary().pipe(
      switchMap(data => {
        return of(data)
    }),catchError(data => {
      const item = {} as EmployeeClock
      item.payRate = 0;
      item.otHours = 0;
      item.regPay = 0;
      this.siteService.notify('Error with time clock summary' + data.toString(), 'close', 2000, 'red')
      return of(item)
    }))

    let employeeID = this.employeeID
    this.getSalesReport(this.employeeID )
  }

  getSalesReport(employeeID: number) {

    let item = {startDate: this.dateFrom, endDate: this.dateTo, zrunID: this.zrunID,
                pendingTransactions: this.pendingTransactions,
                scheduleDateEnd: this.scheduleDateEnd,
              scheduleDateStart: this.scheduleDateStart } as IReportingSearchModel;

    if (employeeID != 0) {
        item.employeeID = employeeID
    }

    if (item.scheduleDateEnd && item.scheduleDateStart) {
      this.sales$ =  this.reportingItemsSalesService.putSalesTaxReport(this.site, item ).pipe(switchMap(data => {
          this.sales = data;
          this.processing = false;
          return of(data)
      })),catchError(data => {
        console.log('data error', data)
        return of(data )
      })
      return
    }

    if (item.zrunID) {
      this.sales$ = this.laborSummary$.pipe(switchMap(data => {
      this.laborSummary = data;
      return this.reportingItemsSalesService.putSalesTaxReport(this.site, item )
        })).pipe(switchMap(data => {
          this.sales = data;
          this.processing = false;
          this.outputComplete.emit('SalesTaxReport')
          return of(data)
      }))
      return
    }

      // if (!item.zrunID) {
    this.sales$ =  this.laborSummary$.pipe(switchMap(data => {
        this.laborSummary = data;
        return this.reportingItemsSalesService.putSalesTaxReport(this.site, item )
    })).pipe(switchMap(data => {
        this.sales = data;
        this.processing = false;
        this.outputComplete.emit('SalesTaxReport')
        return of(data)
      }))
      // }
  }

  dataGridView() {
    this.popOutService.openDynamicGrid(
      {data: this.sales, name: 'ITaxReport'}
    )
  }

  getLaborSummary():  Observable<EmployeeClock>  {
    const site                = this.siteService.getAssignedSite()
    if (this.dateFrom && this.dateTo) {
      const search = {} as EmployeeClockSearchModel
      search.pageNumber = 1;
      search.pageSize =   500;
      search.startDate =  this.dateFrom;
      search.endDate   =  this.dateTo;
      if (this.employeeID != 0) {
        search.employeeID = this.employeeID
      }
      const laborSummary$ = this.employeeClockService.getTimeClockSummaryOnly(site, search)
      return laborSummary$
    }
    return of({} as EmployeeClock)
  }

  downloadCSV() {
    if (!this.sales) { return }
    const item = [] as unknown as ITaxReport[];
    item.push (this.sales)
    this.reportingItemsSalesService.downloadFile(item, 'SalesTaxReport')
  }

  // grid
  // <button mat-raised (click)="print()">
  // <mat-icon>print</mat-icon></button>
  // <div *ngIf="printAction$ | async"></div>
  // @ViewChild('printsection') printsection: ElementRef;
  // @Input() styles: string;
  // @Input() printerName: string;
  // printAction$: Observable<any>;
  // printing: boolean;

  print() {
    if (this.platFormService.isAppElectron) {
      this.printAction$ =  this.setPrintStyles().pipe(switchMap(data => {
        this.printElectron(data)
        return of(data)
      }))
    } else {
      // this.printingService.savePDF(this.printsection.nativeElement, this)
      //document.getElementById('printsection')
      if (!this.printsection.nativeElement) {
        console.log('section is null')
        return
      }
      this.printingService.convertToPDF( this.printsection.nativeElement  )
    }
  }


  setPrintStyles() {
    const styles$ = this.httpClient.get('assets/htmlTemplates/salesreportStyles.html', {responseType: 'text'});
    styles$.pipe(
      switchMap(styles => {
        return of(styles)
    }))
    return styles$
  }

  setPrinter() {
    this.printerName = localStorage.getItem('closeDayPrinter')
  }

  printElectron(styles) {

    // console.log('print electron')
    this.setPrinter()
    const contents = this.getReceiptContents(styles)
    const options = {
      silent: true,
      printBackground: false,
      deviceName: this.printerName
    } as printOptions;

    if (!contents) {
      console.log('no contents in print electron')
      return
    }
    if (!options) {
      console.log('no options in print electron')
      return
    }
    if (!this.printerName) {
      console.log('no printerName in print electron')
      return
    }

    if (contents && this.printerName, options) {
      this.printing = true;
      console.log('print electron')
      this.printingService.printElectron( contents, this.printerName, options)
      this.printing = true;
    }

  }

  //to be moved to component.
  getReceiptContents(styles: string) {

    const content = this.printsection.nativeElement.innerHTML;
    const  title = 'Receipt';
    const loadView       = ({ title }) => {
      return (`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${styles}</style>
            <title>${title}</title>
            <meta charset="UTF-8">
          </head>
          <body>
            <div id="view">${content}</div>
          </body>
        </html>
      `)
    }
    const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView({
      title: "Receipt"
    }));

    return file
  }


}


