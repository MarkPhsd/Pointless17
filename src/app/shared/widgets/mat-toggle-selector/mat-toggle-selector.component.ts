import { Component, OnInit,Output, Input, EventEmitter, HostListener, ViewChild, OnChanges} from '@angular/core';
import { Observable } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { IMenuItem, menuButtonJSON } from 'src/app/_interfaces/menu/menu-products';
@Component({
  selector: 'app-mat-toggle-selector',
  templateUrl: './mat-toggle-selector.component.html',
  styleUrls: ['./mat-toggle-selector.component.scss']
})
export class MatToggleSelectorComponent implements OnChanges {

  @ViewChild('departmentMenuTrigger') departmentMenuTrigger: MatMenuTrigger;

  emptyItem = {id: 0, name: ''}
  @Output() outPutID          = new EventEmitter<any>();
  @Output() outPutItem        = new EventEmitter<any>();
  @Input()  id                : number;
  @Input()  list$             : Observable<any>;
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
  @Input()  toggleStyleHeight = '450px'
  @Input()  toggleHeight      ='toggle-buttons-height-size-medium'
  @Input()  useMatMenu        : boolean;
  @Input()  toggleVertical    = true;
  @Input()  type: string;
  // @Input()  sideBar : boolean;
  departmentID: number;
  subscribed : boolean;
  @Input() styleHeight = ''
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
    this.refresh();
  }

  refresh() {
    if (this.toggleButtonClass) { this.toggleButtonClass = 'toggle-button'}
    try {
      if (this.list$) {
        this.list$.subscribe(data => {
          this.subscribed = true
          this.list = this.sortList(data)
        })
        return
      }
    } catch (error) {

    }

    if (this.list && this.list.length>0) {
      this.list = this.sortList(this.list)
      return
    }

    this.updateScreenSize();
  }

  sortList(list) {
    try {
      this.convertJSONList(list)
      return list.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      return list
    }
  }
  convertJSONList(list: IMenuItem[]) { 
    if (this.type =='menuItem') {
      list = list as unknown as IMenuItem[]
      list.forEach(data => { 
        if (data.json && data.json != '') { 
          data.menuButtonJSON = JSON.parse(data.json)
          console.log(data.menuButtonJSON)
        }
        if (!data.json) { data.menuButtonJSON = {}  as menuButtonJSON}
      })
      this.list = list;
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
      // console.log(this.mouseOver)
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


