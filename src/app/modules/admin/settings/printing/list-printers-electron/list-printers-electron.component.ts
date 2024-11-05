import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlatformService } from 'src/app/_services/system/platform.service';
// import { ElectronService } from 'ngx-electron';
import { PrintingService } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'app-list-printers-electron',
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
      this.printerList = await this.listPrinters();
    }
  }

  listPrinters(): any {

    this.printerList = this.printingService.listPrinters();
  }

  emitPrinter() {
    this.outputPrinterName.emit(this.printerName)
  }
}
