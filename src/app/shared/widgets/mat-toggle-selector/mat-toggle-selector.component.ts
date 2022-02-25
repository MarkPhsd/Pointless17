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
  @Input()  list              : any[]
  @Input()  tinyMenu          : boolean;
  @Input()  showIcon          : boolean;
  @Input()  mouseOver         : boolean;
  @Input()  fieldName         = 'name'
  @Input() materialIcons      = false;
  @Input()  toggleHeight      ='toggle-buttons-height-size-medium'
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
    if (this.list && this.list.length>0) {
      this.list = this.sortList(this.list)
      return
    }

    if (this.list$) {
      this.list$.subscribe(data => {
        this.list = this.sortList(data)
      })
    }
    this.updateScreenSize();
  }

  sortList(list) {
    try {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
    }
  }
  changeSelection() {
    this.outPutID.emit(this.id)
  }

  setItem(item) {
    console.log('toggle item', item)
    this.outPutItem.emit(item)
  }

  setItemMouseOver(item) {
    // console.log('item', item)
    if (!this.mouseOver) { return }
    this.outPutItem.emit(item)
  }

  setItemNull() {
    this.outPutItem.emit(null)
  }
}


