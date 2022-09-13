import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { ICompany, IServiceType, ISetting,  } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { MatSnackBar, } from '@angular/material/snack-bar';
import { ElectronService } from 'ngx-electron';
import { IPOSOrder, IPOSPayment, PosPayment } from 'src/app/_interfaces/transactions/posorder';
import { BtPrintingService } from './bt-printing.service';
import  EscPosEncoder  from 'esc-pos-encoder-ionic';
// import EscPosEncoder from 'esc-pos-encoder';
import { CompanyService } from './company.service';
import { ServiceTypeService } from '../transactions/service-type-service.service';
import { combineLatestWith } from 'rxjs';
import { SitesService } from '../reporting/sites.service';
import { CurrencyPipe, DatePipe, formatCurrency, getCurrencySymbol } from '@angular/common';
import { DateHelperService } from '../reporting/date-helper.service';

@Injectable({
  providedIn: 'root'
})
export class PrintingAndroidService {

  zplSetting            : ISetting;
  receiptLayoutSetting  : ISetting;
  receiptStyles         : ISetting;
  item                  : IInventoryAssignment;
  order                 : IPOSOrder
  isElectronServiceInitiated = false

  constructor(
                private snack: MatSnackBar,
                private siteService: SitesService,
                private serviceTypeService: ServiceTypeService,
                private companyService: CompanyService,
                private btPrintingService: BtPrintingService,
                private currencyPipe: CurrencyPipe,
                private dateHelper: DateHelperService,
              ) {
    // if (this.electronService.remote != null) {
    //   this.isElectronServiceInitiated = true
    // }
  }

  async printAndroidImage(image: any, macAddress: string) {

    if (!image) {
      this.snack.open('no image!', 'image')
      return
    }

    let encoder = new EscPosEncoder();


    // let encoder = new EscPosEncoder({
    //   language: 'esc/pos'
    // });
    let result = encoder
      .initialize()
      .image(image, 128, 128, 'atkinson')
      .encode()
    this.btPrintingService.sendToBluetoothPrinter(macAddress, result)
}

// https://github.com/Ans0n-Ti0/EscPosEncoder
  printAndroidPOSReceipt(order: IPOSOrder, payment: PosPayment, macAddress: string) {

    const site = this.siteService.getAssignedSite()
    const company$ = this.companyService.getCompany(site)
    const service$  = this.serviceTypeService.getTypeCached(site, order.serviceTypeID)

    company$.pipe(combineLatestWith(service$)).subscribe(
      ([company, service, ]) => {
        /*
          Example:
        timerThree first tick: 'Timer One Latest: 0, Timer Two Latest: 0, Timer Three Latest: 0
        timerOne second tick: 'Timer One Latest: 1, Timer Two Latest: 0, Timer Three Latest: 0
        timerTwo second tick: 'Timer One Latest: 1, Timer Two Latest: 1, Timer Three Latest: 0
       */
        const result =  this.writeContent(order, company, service, payment)
        this.printFromAndroid(macAddress, result)
      })

  }

  printFromAndroid(printerName: string, content: any) {
    // this.snack.open('printed something', printerName)
    this.btPrintingService.sendToBluetoothPrinter(printerName, content)
  }

  printTestAndroidReceipt(printerName: string)  {
    this.setLastAndroidPOSPrinterName('androidPOSPrinter', printerName);
    const content = this.testContent()
    this.printFromAndroid(printerName, content)
  }

  formatMoney(value) {
    const temp = `${value}`.replace(/\,/g, "");
    return this.currencyPipe.transform(temp).replace("$", "");
  }

        // for (const item of order.posOrderItems) {
      //   if (item?.itemType?.useType === 'adjustment' && item?.itemType?.type === 'service fee') {
      //     serviceFee += item.gratuity;
      //   } else {
      //     const total = this.formatMoney(item.total)
      //     const line = ``
      //     table.push(  item.quantity.toFixed(2) , (item.productName).substring(0, 10),  total )
      //   }
      // }

      // const paymentsTable = []
      // if (serviceFee != 0) {
      //   const total = this.formatMoney(serviceFee)
      //   const line = `${'Service Fee'}:      $${ serviceFee }`
      //   const paymentsTable = []
      //   .push(line);
      // }

      // for (const item of order.posPayments) {
      //   const currency  = getCurrencySymbol('default', 'narrow');
      //   const total     = this.formatMoney(item.amountPaid) //, locale, currency) ;
      //   const line      = `${item.paymentMethod.name }  $${ total }`
      //   paymentsTable.push(line);
      // }

      writeContent(order: IPOSOrder, comp: ICompany ,serviceType: IServiceType, currentPayment: PosPayment ) {
        const locale = 'en-us'

        try {
          const currency =  getCurrencySymbol('$', 'narrow');
          const taxTotal = this.formatMoney(order.taxTotal) ;
          const total    = this.formatMoney(order.total) ;
          const subTotal = this.formatMoney(order.subTotal) ;

          let serviceFee = 0;
          if (order.gratuity != 0) {
            serviceFee = order.gratuity
          }

          let time = '       ';
          if (order.completionDate) {
            time = this.dateHelper.format( order.completionDate, 'short')
          }
          let customer = '       '
          if (order.customerName) {
            customer = order?.customerName;
          }

          let encoder = new EscPosEncoder();
          let result =
          encoder
          .align('center')
          .line(comp.compName)
          .align('center')
          .line(comp.compAddress1 + ' ' + comp.compAddress2)
          .align('center')
          .line(`${comp.compCity},${comp.compState} ${comp.compZip}`)
          .align('center')
          .line(comp.phone)
          .newline()
          .line('--------------------')
          .newline()
          .align('left')
          .bold()
          .line(`${'ID'}     ${'Type'}             ${'Time'}`)
          .line(`${order.id} ${order?.serviceType.substring(0,6)} ${time}`)

          if (customer != '') {
            result = result.line(`${'Customer'}`)
            result = result.line(`${customer}`)
          }

          result = result

          .bold()
          .line('---------------------------')

          //this is used for when order grouping payments occurs.
          for (const item of order.posOrderItems) {
            // if (item?.itemType?.useType === 'adjustment' && item?.itemType?.type === 'service fee') {
            //   serviceFee += item.gratuity;
            // } else {
              const quantity = item.quantity.toFixed(2);
              const total = this.formatMoney(item.total)
              const spacer = this.getSpacer(total.length + quantity.length, total.length )

              const itemName = (`${item.productName}${'                                   '}`).substring(0, spacer)

              const line = `${quantity} ${itemName} ${total}`

              result = result.line(line);
            // }
          }

          result = result

          .bold()
          .line('---------------------------')
          .newline()

          .newline()
          .align('right')
          .line(`Subtotal: ${subTotal}`)
          .align('right')
          .line(`Tax     :  ${taxTotal}`)
          .align('right')

          if (serviceFee != 0) {
            const total = this.formatMoney(serviceFee) ;
            const perc  = ((serviceFee / +subTotal) * 100).toFixed(0);
            const line = `${'Service Fee'} %${perc}:      $${ serviceFee }`
            result = result.line(line);
          }
          result = result

          .line(`Total   : ${total}`)
          .newline()

          if (currentPayment) {
              const item = currentPayment
            // for () {
              const total = this.formatMoney(item.amountPaid) ;
              const line = `${item.paymentMethod.name }  $${ total }`
              result = result.line(line);
              if (item.entryMethod) {
                let ccInfo = `${item.entryMethod} -Ref ${item.refNumber}`
                result = result.line(ccInfo);
                ccInfo = `Approval: ${item.approvalCode} `
                result = result.line(ccInfo);

                const message = 'I agree to pay the above amount noted. I agree to the purchase agreement.'
                result = result.line(message);
                result.newline()
                result.newline()
                result.line('Signature _______________')
              }
            // }
          }

          result = result

          .newline()
          if (serviceType.instructions) {
            result = result.line(`${'Policy'}`)
            result = result.line(`${serviceType.instructions}`)
          }
          result = result
          .newline()
          .newline()
          .encode()
          return result;

      } catch (error) {
        console.log('error', error)
      }
  }

  getSpacer(quantity: number, priceLength: number) {
    const spacer = '                    '
    let returnValue

    if (priceLength == 3) {
      returnValue = 21
    }
    if (priceLength == 4) {
      returnValue = 20
    }
    if (priceLength == 5) {
      returnValue = 19
    }
    if (priceLength == 6) {
      returnValue = 18
    }
    if (priceLength == 7) {
      returnValue = 17
    }

    if (quantity == 3) {
      return returnValue - quantity
    }
    if (quantity == 4) {
      return returnValue - quantity - 1
    }
    if (quantity == 5) {
      return returnValue - quantity - 2
    }
    if (quantity == 6) {
      return returnValue - quantity - 3
    }
    if (quantity == 6) {
      return returnValue - quantity - 4
    }
    return 21;

  }
  testContent() {
    const encoder = new EscPosEncoder();
    let result = encoder

    .align('center')
    .line('Biz Name')
    .align('center')
    .line('1234 Washington St.')
    .align('center')
    .line('San Diego, CA 92111')
    .align('center')
    .line('866-973-8099')
    .newline()
    .newline()
    .line('_____________________')
    .line('1  Blueberry Pie   $4.95')
    .line('2  Blueberry Pie  $14.95')
    .line('3  Blueberry Pie  $34.95')
    .line('_____________________')
    .newline()
    .newline()
    .align('right')
    .line('Subtotal. $54.85')
    .align('right')
    .line('Tax        $2.95')
    .align('right')
    .line('Total     $58.69')
    .newline()
    .newline()
    .newline()
    .newline()
    .encode()
    return result
  }

  printAndroidOrder(item: ICompany) {
    const encoder = new EscPosEncoder();
    let result = encoder

  }

  getReceiptHeader(result: any, item: ICompany){

    const encoder = new EscPosEncoder();
    result
    .align('center')
    .line(item.compName)
    .align('center')
    .line(item.compBillingAddress)
    .align('center')
    .line(`${item.compBillingCity} , ${item.compBillingState} ${item.compBillingZip}`)
    .align('center')
    .line(`${item.phone}`)

    return result
  }

  getReceiptOrderHeader(order :  IPOSOrder) { }
  getItems(order : IPOSOrder) {}
  getSubtotal(order :  IPOSOrder) {}
  getPayments(order :  IPOSOrder) {}
  getReceiptFooter(order :  IPOSOrder) {}

  getLastAndroidPOSPrinterName(): string {
    return  localStorage.getItem('androidPOSPrinter')
  }

  setLastAndroidPOSPrinterName(printerType: string, printerName: string) {
    localStorage.setItem('androidPOSPrinter', printerName)
  }

}
