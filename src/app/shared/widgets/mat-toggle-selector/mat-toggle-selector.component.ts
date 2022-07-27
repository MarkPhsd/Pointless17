import { Component, OnInit,Output, Input, EventEmitter, HostListener, ViewChild, OnChanges} from '@angular/core';
import { Observable } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
@Component({
  selector: 'app-mat-toggle-selector',
  templateUrl: './mat-toggle-selector.component.html',
  styleUrls: ['./mat-toggle-selector.component.scss']
})
export class MatToggleSelectorComponent implements OnChanges {

  @ViewChild('departmentMenuTrigger') departmentMenuTrigger: MatMenuTrigger;

  emptyItem = {id: 0, name: ''}
  @Input()  id                : number;
  @Input()  list$             : Observable<any>;
  @Output() outPutID          = new EventEmitter<any>();
  @Output() outPutItem        = new EventEmitter<any>();
  @Input()  hideAllOption     : boolean;
  @Input()  textLength        = 20
  @Input()  toggleWidth       = ''
  @Input()  toggleDimensions  = 'toggle-group'
  @Input()  toggleButtonClass = 'toggle-button'
  @Input()  buttonDimensions  = 'button-dimensions-short'
  @Input()  list              : any[]
  @Input()  tinyMenu          : boolean;
  @Input()  showIcon          : boolean;
  @Input()  mouseOver         : boolean;
  @Input()  fieldName         = 'name'
  @Input()  materialIcons     = false;
  @Input()  toggleHeight      ='toggle-buttons-height-size-medium'
  @Input()  useMatMenu        : boolean;
  @Input()  toggleVertical    = true;

  departmentID: number;
  subscribed : boolean;

  constructor() {
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.tinyMenu = false
    if (window.innerWidth < 768) {
      this.tinyMenu = true
    }
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refresh();
  }

  refresh() {

    if (this.toggleButtonClass) { this.toggleButtonClass = 'toggle-button'}

    if (this.list$) {
      this.list$.subscribe(data => {
        this.subscribed = true
        this.list = this.sortList(data)
      })
      return
    }

    if (this.list && this.list.length>0) {
      this.list = this.sortList(this.list)
      return
    }

    this.updateScreenSize();
  }

  sortList(list) {
    try {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      return list
    }
  }

  changeSelection() {
    this.outPutID.emit(this.id)
  }

  setItem(item) {

    if (!item) { return }

    if (this.useMatMenu) {
      this.departmentID = item.id;
      this.openMenu()
      return
    }

    this.outPutItem.emit(item)
  }

  setItemMouseOver(item) {
    if (this.mouseOver != true) {
      console.log(this.mouseOver)
      return
    }
    this.outPutID.emit(item)

    if (!item) { return }
    if (this.useMatMenu) {
      this.departmentID = item.id;
      this.openMenu()
      return
    }

    this.outPutItem.emit(item)
  }

  openMenu() {
    this.departmentMenuTrigger.openMenu();
  }

  closeMenu() {
    // this.departmentMenuTrigger.closeMenu();
  }

  setItemNull() {
    if (this.mouseOver != true) {
      return
    }
    this.outPutItem.emit(null)
  }

}


