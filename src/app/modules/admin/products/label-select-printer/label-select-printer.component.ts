import { Component, OnInit,Input,OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of, switchMap , Observable} from 'rxjs';
import { IProduct, ISetting, PosOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';

@Component({
  selector: 'label-select-printer',
  templateUrl: './label-select-printer.component.html',
  styleUrls: ['./label-select-printer.component.scss']
})
export class LabelSelectPrinterComponent implements OnInit, OnChanges {

  @Input() product : IProduct
  @Input() menuItem: IMenuItem;
  @Input() poItem: PosOrderItem;
  action$ : Observable<any>;

  labelID : number;
  printerName : string;
  printQuantity : number;
  printingEnabled : boolean;
  isAppElectron : boolean;
  labelSetting: ISetting
  printForm: FormGroup;
  product$: any;
  remainingQuantity: number;

  constructor(private printingService : PrintingService,
              private siteService: SitesService,
              private fb: FormBuilder,
              private menuService: MenuService,
              private renderingService: RenderingService,
              private platFormService: PlatformService,
  ) {

  }

  ngOnInit(): void {
    this.isAppElectron =  this.platFormService.isAppElectron
    this.printerName = this.getLastPrinterName();
    this.refreshLabel()

    this.initForm()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.refreshLabel()

    if (this.poItem) {
      this.initForm()
    }
  }

  refreshLabel() {
    let product$: Observable<IProduct>;
    const site = this.siteService.getAssignedSite()

    console.log('poItem', this.poItem)
    if (this.poItem) {
      product$ = this.menuService.getProduct(site, this.poItem.productID)
      console.log('poItem productID', this.poItem?.productID)
    }

    if (this.menuItem) {
       product$ = this.menuService.getProduct(site, this.menuItem.id)
    }

    if (!product$) {
      console.log('no prouduct')
      return
    } else {

    }

    this.product$ =  product$.pipe(switchMap(data => {
      this.labelID = this.printingService.getLastLabelUsed();
      this.product = data;
      this.initForm()
      return of(data)
    }))


  }

  initForm() {
    let count = 0

    if (this.poItem) {
      count = +this.poItem?.quantity
      this.printForm = this.fb.group({
        printQuantity: [count]
      } )
      return;
    }

    if (this.product) {
      count = +this.product?.productCount
      this.printForm = this.fb.group({
        printQuantity: [count]
      } )
      return
    }

    if (this.menuItem) {
      count = +this.menuItem?.productCount
    }

    this.printForm = this.fb.group({
      printQuantity: [count]
    } )
  }

  getPrinterName(name: string) {
    this.printerName = name
    this.setLastPrinterName(name)
  }

  getLabelSetting(labelSetting: ISetting)  {
    this.labelSetting = labelSetting;
    this.setLastlabelUsed(this.labelID)
  }

  setLastlabelUsed(id: number) {
    this.printingService.setLastLabelUsed(this.labelSetting.id)
  }
  getLastPrinterName(): string {
    return this.printingService.getLastLabelPrinter()
  }

  setLastPrinterName(name: string) {
    this.printingService.setLastLabelPrinterName(name)
  }

  printLegal() {
  }

  printSerial() {
  }

  async printSku() {
    if (this.labelSetting && this.product) {
      const content = this.renderingService.interpolateText(this.product, this.labelSetting.text);
      this.printQuantity = +this.printForm.controls['printQuantity'].value || 1;

      const maxQuantity = 1;
      let remainingQuantity = this.printQuantity;

      while (remainingQuantity > 0) {
        this.remainingQuantity = remainingQuantity;
        const currentBatchQuantity = Math.min(remainingQuantity, maxQuantity);
        this.printingService.printLabelByQuantity(content, this.printerName, currentBatchQuantity);
        this.printingService.labelPrinter = this.printerName;
        await this.printingService.printJoinedLabelsWait();
        await this.delay(2000); // Add a 1-second delay between batches
        this.printingService.labelContentList = [];
        remainingQuantity -= currentBatchQuantity;
        this.remainingQuantity = remainingQuantity;
      }
    }
    this.remainingQuantity = 0;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // printSku() {
  //   if (this.labelSetting && this.product) {
  //     const content = this.renderingService.interpolateText(this.product, this.labelSetting.text);
  //     this.printQuantity = +this.printForm.controls['printQuantity'].value || 1;

  //     const maxQuantity = 3;
  //     let remainingQuantity = this.printQuantity;

  //     while (remainingQuantity > 0) {


  //         const currentBatchQuantity = Math.min(remainingQuantity, maxQuantity);
  //         this.printingService.printLabelByQuantity(content, this.printerName, currentBatchQuantity);
  //         this.printingService.labelPrinter = this.printerName;
  //         this.printingService.printJoinedLabelsWait();
  //         this.printingService.labelContentList = []
  //         remainingQuantity -= currentBatchQuantity;

  //     }
  //   }
  // }
  // printSku() {
  //   if (this.labelSetting && this.product) {
  //     const content = this.renderingService.interpolateText(this.product, this.labelSetting.text)
  //     this.printQuantity = +this.printForm.controls['printQuantity'].value;
  //     if(this.printQuantity == null) { this.printQuantity == 1} {
  //       this.printingService.printLabelByQuantity(content, this.printerName, this.printQuantity )
  //       this.printingService.labelPrinter = this.printerName;
  //       this.printingService.printJoinedLabels();
  //     }
  //   }
  // }

  printLabels() {
    this.printingService.printJoinedLabels();
  }

}
