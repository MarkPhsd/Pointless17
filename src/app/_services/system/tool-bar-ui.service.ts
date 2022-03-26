import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolBarUIService {

  private _toolbarSideBar   = new BehaviorSubject<any>(null);
  public toolbarSideBar$    = this._toolbarSideBar.asObservable();

  private _searchSideBar    = new BehaviorSubject<any>(null);
  public searchSideBar$     = this._searchSideBar.asObservable();

  private _orderBar          = new BehaviorSubject<any>(null);
  public  orderBar$          = this._orderBar.asObservable();

  private  searchBarWidth     = 195;
  private _searchBarWidth    = new BehaviorSubject<number>(null);
  public  _searchBarWidth$   = this._searchBarWidth.asObservable();

  private _departmentMenu     = new BehaviorSubject<any>(null);
  public  departmentMenu$     = this._departmentMenu.asObservable();

  private _barSize    = new BehaviorSubject<boolean>(null);
  public  barSize$    = this._barSize.asObservable();

  private _departmentID    = new BehaviorSubject<number>(null);
  public  departmentID$    = this._barSize.asObservable();
  departmentID: number;

  private barSize   : boolean;

  private toolBar   : boolean;
  private searchBar : boolean;
  private orderBar  : boolean;

  constructor() {
    this.toolBar = false;
    this.searchBar = false;
    this.orderBar = false
    this._orderBar.next(false)
  }

  updateDepartSearch(id) {
    this._departmentID.next(id)
    this.departmentID = 0
  }

  updateDepartmentMenu(item) {
    this._departmentMenu.next(item)
  }

  resizeWindow() {
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }


  updateBarSize(value: boolean) {
    this._barSize.next(value)
    this.barSize = value;
    this.resizeWindow();
  }

  updateSearchBarWidth(value: number) {
    // this.searchBarWidth = value;
    // this._searchBarWidth.next(value)
    // console.log(this.searchBarWidth)
    // console.log('value', value)
  }

  updateOrderBar(value: boolean) {
    this.orderBar = value
    this._orderBar.next(value)
    this.resizeWindow();
  }

  resetOrderBar(value: boolean) {
    this.orderBar = value
  }

  updateToolBarSideBar(value: boolean) {
    this.toolBar = value
    this.searchBar = false;
    this._toolbarSideBar.next(value);
    this.resizeWindow();
  }

  updateSearchBarSideBar(value: boolean) {
    this.searchBar = value
    this.toolBar = false;
    this._toolbarSideBar.next(value);
    this.resizeWindow();
  }

  switchToolBarSideBar() {
    if (this.searchBar) {
      this.searchBar = false
      this._searchSideBar.next(false)
    } else {
      this.searchBar = false;
      this.toolBar   = ! this.toolBar
      this._toolbarSideBar.next(this.toolBar);
      this._searchSideBar.next(false);
      this.updateBarSize(this.barSize)
    }
    this.resizeWindow();
  }

  hidetoolBars() {
    this.updateSearchBarSideBar(false)
    this.updateOrderBar(false)
  }

  switchSearchBarSideBar() {
    //if the toolbar is showing and is in search mode,
    //then hide the toolbar.
    if (!this.toolBar && this.searchBar) {
      this.toolBar = true
      this.searchBar = true
      this._searchSideBar.next(true)
      this._toolbarSideBar.next(true);
      this.resizeWindow();
      return
    }

    if (this.toolBar && this.searchBar)
      {
        this.searchBar = false
        this.toolBar   = false
        // this.hidetoolBars
        this._searchSideBar.next(false)
        this._toolbarSideBar.next(false);
        this.resizeWindow();
        return
       } else

    {
      //if the toolbar is showing
      // and is not in seach mode.
      if (this.toolBar && !this.searchBar )   { this.searchBar = true; }
      //if the toolbar is not showing
      if (!this.toolBar )    {
        this.searchBar = true;
        this.toolBar   = true;
      }
    }

    this._searchSideBar.next(this.searchBar)
    this._toolbarSideBar.next(this.toolBar);
    this.resizeWindow();
  }

  showSearchSideBar() {
    this.searchBar = true
    this.toolBar   = false
    this._searchSideBar.next(true)
    this._toolbarSideBar.next(false);
    this.resizeWindow();
  }


}
