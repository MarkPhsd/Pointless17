import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ITaxReport, ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { IPaymentSalesSummary } from 'src/app/_services/reporting/sales-payments.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'app-payment-report-data',
  templateUrl: './payment-report-data.component.html',
  styleUrls: ['./payment-report-data.component.scss']
})
export class PaymentReportDataComponent implements OnInit {

  @Output() outPutRefresh = new EventEmitter<any>;
  @ViewChild('printsection') printsection: ElementRef;
  @Input() styles: string;
  @Input() printerName: string;
  printAction$: Observable<any>;
  printing: boolean;

  @Input() site    : ISite;
  @Input() dateTo  : string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() groupBy : string;
  @Input() type    : string;
  @Input() zrunID  : string;
  @Input() sales   : IPaymentSalesSummary;
  @Input() reportRunID: number;
  @Input() autoPrint: boolean;
  @Input() surCharge: boolean
  @Input() batchData: any;
  @Input() salesReportOBS:any;

  salesReport$: Observable<ITaxReport>;
  processing  : boolean;

  constructor(
    private popOutService: ProductEditButtonService,
    private reportingItemsSalesService: ReportingItemsSalesService,
    public platFormService: PlatformService,
    private printingService: PrintingService,
    private httpClient: HttpClient,
    )
  {
    // const item = {} as ITaxReport;
    // item.grossSales;
    
  }

  get groupByPayment() {
    if (!this.groupBy) { return false}
    if (this.groupBy.toLowerCase() === 'paymentMethod'.toLowerCase()  ) {
      return true;
    }
    if (this.groupBy.toLowerCase() === 'buySell'.toLowerCase()  ) {
      return true;
    }
    return false;
  }

  ngOnInit(): void {
    const i = 0
    this.type = this.type.toUpperCase()
    
    if (this.salesReportOBS) { 
      this.getSalesReport(this.salesReportOBS)
    }
  }

  getSalesReport(reportCriteria: any) { 
    // if (!reportCriteria) {return }
    // const item = reportCriteria;
    // this.processing = true;
    // if (item.zrunID) {
    //   this.salesReport$ =  this.reportingItemsSalesService.putSalesTaxReport(this.site, item )
    //     .pipe(switchMap(data => {
    //       // this.reportCriteria = data;
    //       this.processing = false;
    //       // this.outputComplete.emit('SalesTaxReportSummary')
    //       return of(data)
    //   }))
    //   return
    // }

    // this.salesReport$ =  this.reportingItemsSalesService.putSalesTaxReport(this.site, item ).pipe(switchMap(data => {
    //   // this.salesReport = data;
    //   this.processing = false;
    //   // this.outputComplete.emit('SalesTaxReport')
    //   return of(data)
    // }))
  }

  refresh() {
    this.outPutRefresh.emit(true)
  }

  downloadCSV() {
    if (!this.sales) { return }
    this.reportingItemsSalesService.downloadFile(this.sales.paymentSummary, 'PaymentReport')
  }

  dataGridView() {
    this.popOutService.openDynamicGrid(
      {data:this.sales.paymentSummary, name: 'PaymentSummary'}
    )
  }

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
