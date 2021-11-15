import { Component, OnInit,Output, Input, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mat-toggle-selector',
  templateUrl: './mat-toggle-selector.component.html',
  styleUrls: ['./mat-toggle-selector.component.scss']
})
export class MatToggleSelectorComponent {

  emptyItem = {id: 0, name: ''}
  @Input()  id                : number;
  @Input()  list$             : Observable<any>;
  @Output() outPutID          = new EventEmitter<any>();
  @Output() outPutItem          = new EventEmitter<any>();
  @Input()  hideAllOption     : boolean;

  @Input()  toggleDimensions  = 'toggle-group'
  @Input()  toggleButtonClass = 'toggle-button'
  @Input()  buttonDimensions  = 'button-dimensions-tall'

  constructor() {
     if (this.toggleButtonClass) {
      this.toggleButtonClass = 'toggle-button'
    }
  }

  changeSelection() {
    this.outPutID.emit(this.id)
  }

  setItem(item) {
    this.outPutItem.emit(item)
  }

}
