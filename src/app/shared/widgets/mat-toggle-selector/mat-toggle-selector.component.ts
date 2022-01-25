import { Component, OnInit,Output, Input, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mat-toggle-selector',
  templateUrl: './mat-toggle-selector.component.html',
  styleUrls: ['./mat-toggle-selector.component.scss']
})
export class MatToggleSelectorComponent implements OnInit {

  emptyItem = {id: 0, name: ''}
  @Input()  id                : number;
  @Input()  list$             : Observable<any>;
  @Output() outPutID          = new EventEmitter<any>();
  @Output() outPutItem          = new EventEmitter<any>();
  @Input()  hideAllOption     : boolean;

  @Input()  toggleDimensions  = 'toggle-group'
  @Input()  toggleButtonClass = 'toggle-button'
  @Input()  buttonDimensions  = 'button-dimensions-short'
  list                        : any[]

  constructor() {
     if (this.toggleButtonClass) {
      this.toggleButtonClass = 'toggle-button'
    }
  }

  ngOnInit(): void {
    if (this.list$) {
      this.list$.subscribe(data => {
        this.list = data;
        this.list =  data.sort((a, b) => (a.name > b.name) ? 1 : -1);
      })
    }
  }

  changeSelection() {
    this.outPutID.emit(this.id)
  }

  setItem(item) {
    this.outPutItem.emit(item)
  }

}
