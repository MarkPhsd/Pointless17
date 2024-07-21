import { Component, OnInit,Input,OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of, switchMap , Observable, Subject, Subscription, BehaviorSubject} from 'rxjs';
import { IPOSOrder, IProduct, ISetting, PosOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ItemLabelPrintOut, PrintingService } from 'src/app/_services/system/printing.service';
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
  @Input() poItems: PosOrderItem[];

// = new EventEmitter();
  labelID : number;
  printerName : string;
  printQuantity : number;
  printingEnabled : boolean;
  isAppElectron : boolean;
  labelSetting: ISetting
  printForm: FormGroup;
  product$: any;
  remainingQuantity: number;

  autoPrintQUe: Subscription;

  public _notifier       : Subscription ; //new BehaviorSubject<boolean>(null);
  // public notifier$       = this._notifier.asObservable();

  currentItemIndex: number; 
  initAutoQue() { 

    this._notifier = this.printingService.itemLabelPrintingComplete$.subscribe(data => { 
      //we have already started the loop. 
      //at this point, we have completed the first label print
      //nowe we received a signal that sales we can do the the next item
      // instead of doing anything, we can just trigger the same function we started with
      //and apply the current index
      this.currentItemIndex = this.currentItemIndex + 1
      this.poItem = this.poItems[this.currentItemIndex]
      this.printItemLabel()
    })
   
    this.autoPrintQUe = this.printingService.autoLabelPrinting$.subscribe(data => { 
      if (data && data.printOutAuto) {

        //then we print
        
        //when we are done printing
        //we update the subscriber. 
        //then on the parent
        //we know that the print has completed and we can move to the next item
        //from there, we update the subscribert to say that the printing is not complete, but first we submit a new item
        //that new item is triggered such that the next print out prints the next item on the transaction. 
        //from there we repeat until the order is complete
      }
    })
  }

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
    this.initForm();

    this.initAutoQue()
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

  printItemLabel() {
    let product$: Observable<IProduct>;
    const site = this.siteService.getAssignedSite()
    if (this.poItem) {
      product$ = this.menuService.getProduct(site, this.poItem.productID)
      console.log('poItem productID', this.poItem?.productID)
    }

    if (!product$) { return }
    this.product$ =  product$.pipe(switchMap(data => {
      this.labelID = this.printingService.getLastLabelUsed();
      this.product = data;
      this.initForm()
      this.printSku()
      return of(data)
    }))
  }
  //
  printAllItems() {
    this.printOutItems(0)
  }

  printOutItems(index: number) { 
    this.currentItemIndex = index;
    this.poItem = this.poItems[index]
    this.printItemLabel()
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
        if (this.remainingQuantity == 0) { 
          this.printingService._itemLabelPrintingComplete.next(true)
        }
      }
    }
    this.remainingQuantity = 0;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printLabels() {
    this.printingService.printJoinedLabels();
  }

}
