import { Component, EventEmitter, HostListener, Input, OnInit , Output} from '@angular/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-edit-buttons-standard',
  templateUrl: './edit-buttons-standard.component.html',
  styleUrls: ['./edit-buttons-standard.component.scss']
})
export class EditButtonsStandardComponent  {

  @Output() outPutPrint           : EventEmitter<any> = new EventEmitter<any>();
  @Output() outputeupdateItem     : EventEmitter<any> = new EventEmitter<any>();
  @Output() outputupdateItemExit  : EventEmitter<any> = new EventEmitter<any>();
  @Output() outputupdatedeleteItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputupdateonCancel  : EventEmitter<any> = new EventEmitter<any>();
  @Output() outputCopy            : EventEmitter<any> = new EventEmitter<any>();
  @Output() outputViewOrder       : EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutStartOrder       : EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutAdd             : EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutEmail           : EventEmitter<any> = new EventEmitter<any>();

  @Input() emailOption : boolean;
  @Input() enableAdd  : boolean;
  @Input() enableCopy  : boolean;
  @Input() enableUpdate: boolean;
  @Input() enableDelete: boolean;
  @Input() hideExit    : boolean;
  @Input() printOption : boolean;
  @Input() viewOrder   : boolean;
  @Input() historyItem         : boolean;
  @Input() hideSave            : boolean;
  @Input() enableStartOrder    : boolean;

  smallDevice = false;

  constructor(
    private userauthorizationService: UserAuthorizationService,
    ) {
      this.enableCopy   = false
      this.enableUpdate = true
      this.enableDelete = false

      if ( this.userauthorizationService.isUserAuthorized('manager') ||
        this.userauthorizationService.isUserAuthorized('admin') ) {
        this.enableDelete = true
        // this.enableStartOrder = true
      }

      if (this.userauthorizationService.isUserAuthorized('user')) {
        this.enableStartOrder = false
      }

      this.updateItemsPerPage();
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
  }

  print() {
    this.outPutPrint.emit('true')
  }

  email() {
    this.outPutEmail.emit('demo')
  }

  copy() {
    this.outputCopy.emit('demo')
  }

  updateItem() {
    this.outputeupdateItem.emit('demo')
  }

  updateItemExit() {
    this.outputupdateItemExit.emit('demo')
  }

  deleteItem() {
    this.outputupdatedeleteItem.emit('demo')
  }



  onCancel() {
    this.outputupdateonCancel.emit('demo')
  }

  onOutputViewOrder() {
    this.outputViewOrder.emit('demo')
  }

  onOutPutAdd(){
    this.outPutAdd.emit('demo')
  }

  onOutPutStartOrder(){
    this.outPutStartOrder.emit('demo')
  }

}
