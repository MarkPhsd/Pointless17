import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { IPaymentSalesSummary } from 'src/app/_services/reporting/sales-payments.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'app-payment-report-data',
  templateUrl: './payment-report-data.component.html',
  styleUrls: ['./payment-report-data.component.scss']
})
export class PaymentReportDataComponent implements OnInit {

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


  constructor(
    private popOutService: ProductEditButtonService,
    private reportingItemsSalesService: ReportingItemsSalesService,
    //to be moved to component.
    private platFormService: PlatformService,
    private printingService: PrintingService,
    private httpClient: HttpClient,
    )
     { }

  ngOnInit(): void {
    const i = 0
    this.type = this.type.toUpperCase()
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
