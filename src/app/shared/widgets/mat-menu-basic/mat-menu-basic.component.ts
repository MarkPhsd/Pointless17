import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'mat-menu-basic',
  templateUrl: './mat-menu-basic.component.html',
  styleUrls: ['./mat-menu-basic.component.scss']
})
export class MatMenuBasicComponent implements OnInit {
  smallDevice           : boolean;

  constructor() { }
  @Output() outputDelete   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSave   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSettings   :  EventEmitter<any> = new EventEmitter();
  @Output() outputPrint   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSelectedItem : EventEmitter<any> = new EventEmitter();
  @Output() outputOpen   :  EventEmitter<any> = new EventEmitter();

  @Input()  enablePrint = false;
  @Input()  enableDelete = false;
  @Input()  enableSettings = false;
  @Input()  enableSave = false;
  @Input()  enableOpen = false;

  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
  }

  ngOnInit(): void {
    const i = 0
  }

  print() {
    this.outputPrint.emit('true')
  }

  delete(){
    const result = window.confirm('Are you sure you want to delete this item?')
    if (result) {
      this.outputDelete.emit('true')
    }
  }
  save() {
    this.outputSave.emit('true')
  }

  settings() {
    this.outputSettings.emit('true')
  }

  open() {
    this.outputOpen.emit('true')
  }


}
