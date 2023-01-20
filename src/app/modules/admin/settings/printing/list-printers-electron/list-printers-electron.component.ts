import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PrintingService } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'app-list-printers-electron',
  templateUrl: './list-printers-electron.component.html',
  styleUrls: ['./list-printers-electron.component.scss']
})
export class ListPrintersElectronComponent implements OnInit {

  @Output() outputPrinterName   :      EventEmitter<any> = new EventEmitter();
  @Input()  printerList         : any;
  isElectronApp    : boolean;

  @Input()  printerName         : string

  constructor(private electronService: ElectronService,
              private printingService: PrintingService) { }

  ngOnInit(): void {
    if (this.electronService.remote != null) {
      this.isElectronApp = true
    }
    if (this.isElectronApp) {
      this.listPrinters();
    }
  }

  listPrinters(): any {
    this.printerList = this.printingService.listPrinters();
  }

  emitPrinter() {
    this.outputPrinterName.emit(this.printerName)
  }
}
