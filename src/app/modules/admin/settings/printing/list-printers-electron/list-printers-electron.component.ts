import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'app-list-printers-electron',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './list-printers-electron.component.html',
  styleUrls: ['./list-printers-electron.component.scss']
})
export class ListPrintersElectronComponent implements OnInit {

  @Output() outputPrinterName   :      EventEmitter<any> = new EventEmitter();
  @Input()  printerList         : any;
  @Input()  isElectronApp    : boolean;

  @Input()  printerName         : string

  // private electronService: ElectronService,
  constructor(
              private platFormService: PlatformService,
              private printingService: PrintingService) { }

   async ngOnInit() {
    if (this.platFormService.isAppElectron) {
      this.isElectronApp = true
    }
    if (this.isElectronApp && !this.printerList) {
      const list = await this.listPrinters();
      console.log('list', list)
      this.printerList =  list
    }
  }

  emitPrinter() {
    this.outputPrinterName.emit(this.printerName)
  }


  async listPrinters(): Promise<any> {
    try {
      return (window as any).electron.listPrinters();
    } catch (error) {
      return Promise.resolve(['Error Getting Printers']);
    }
  }

}
