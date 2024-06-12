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
  @Input() poItem: PosOrderItem
  labelID : number;
  printerName : string;
  printQuantity : number;
  printingEnabled : boolean;
  isAppElectron : boolean;
  labelSetting: ISetting
  printForm: FormGroup;
  product$: any;

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
  }

  refreshLabel() {
    let product$: Observable<IProduct>;
    const site = this.siteService.getAssignedSite()

    if (this.poItem) {
      product$ = this.menuService.getProduct(site, this.poItem.productID)
      // console.log('produtID', this.poItem?.productID)
    }
    if (this.menuItem) {
       product$ = this.menuService.getProduct(site, this.menuItem.id)
    }

    if (!product$) {
      // console.log('no observable')
      return
    } else {
      // console.log('observable' )
    }

    product$.pipe(switchMap(data => {
      // console.log('product', data)
      this.labelID = this.printingService.getLastLabelUsed();
      this.product = data;
      return of(data)
    }))

    this.product$ = product$;

  }

  initForm() {
    let count = 0
    if (this.poItem) {
      count = this.poItem.quantity
      this.printForm = this.fb.group({
        printQuantity: [count]
      } )
      return;
    }
    if (this.product) {
      count = this.poItem.quantity
      this.printForm = this.fb.group({
        printQuantity: [count]
      } )
      return
    }
    if (this.menuItem) {
      count = this.menuItem.productCount
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

  printSku() {
    // const item =  this.fakeDataService.getInventoryItemTestData();
    // const printString = this.renderingService.interpolateText(item, zplString )
    if (this.labelSetting && this.product) {
      const content = this.renderingService.interpolateText(this.product, this.labelSetting.text)
      this.printQuantity = +this.printForm.controls['printQuantity'].value;
      if(this.printQuantity == null) { this.printQuantity == 1}
      for (let i = 0; i < this.printQuantity; i++) {
         this.printingService.printLabelElectron(content, this.printerName)
      }
    }
  }

}
