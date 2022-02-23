import { Component, OnInit,Output, Input, EventEmitter, HostListener} from '@angular/core';
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
  @Output() outPutItem        = new EventEmitter<any>();
  @Input()  hideAllOption     : boolean;
  @Input()  textLength        = 20
  @Input()  toggleDimensions  = 'toggle-group'
  @Input()  toggleButtonClass = 'toggle-button'
  @Input()  buttonDimensions  = 'button-dimensions-short'
  @Input()  list                        : any[]
  @Input()  tinyMenu: boolean;
  @Input()  showIcon: boolean;
  @Input()  toggleHeight ='toggle-buttons-height-size-medium'
  constructor() {
  }

  // using Array.sort directly
  // users.sort(byPropertiesOf<User>(['name', '-age', 'id']))

  // // using the convenience function for much more readable code
  // sort(users, 'name', '-age', 'id')
  @HostListener("window:resize", [])
  updateScreenSize() {
    if (window.innerWidth < 768) {
      this.tinyMenu = true
    }
  }

  ngOnInit(): void {

    if (this.toggleButtonClass) { this.toggleButtonClass = 'toggle-button'}

    if (this.list) {
      this.list =  this.list.sort((a, b) => a.name.localeCompare(b.name));
      return
    }

    if (this.list$) {
      this.list$.subscribe(data => {
        this.list = data;
        this.list =  this.list.sort((a, b) => a.name.localeCompare(b.name));
        console.log('list sorted', this.list)
      })
    }
    this.updateScreenSize();
  }

  changeSelection() {
    this.outPutID.emit(this.id)
  }

  setItem(item) {
    this.outPutItem.emit(item)
  }


}


