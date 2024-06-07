import { Component, OnInit,Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IProduct, ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';

@Component({
  selector: 'label-select-printer',
  templateUrl: './label-select-printer.component.html',
  styleUrls: ['./label-select-printer.component.scss']
})
export class LabelSelectPrinterComponent implements OnInit {
  
  @Input() product : IProduct
  
  labelID : number;
  printerName : string;
  printQuantity : number;
  printingEnabled : boolean;
  isAppElectron : boolean;
  labelSetting: ISetting
  printForm: FormGroup;
  
  constructor(private printingService : PrintingService,
              private siteService: SitesService,
              private fb: FormBuilder,
              private renderingService: RenderingService,
              private platFormService: PlatformService,
  ) { 
    
  }

  ngOnInit(): void {
    this.isAppElectron =  this.platFormService.isAppElectron
    this.printerName = this.getLastPrinterName();
    this.labelID = this.printingService.getLastLabelUsed();
    if (this.product) { 
      this.initForm()
    }
  }


  initForm() { 
    this.printForm = this.fb.group({
      printQuantity: [this.product.productCount]
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
      //then get the quantity from this.printQuantity
      if(this.printQuantity == null) { this.printQuantity == 1}
      for (let i = 0; i < this.printQuantity; i++) {
         this.printingService.printLabelElectron(content, this.printerName)
      }
    }
  }

}
