import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolBarUIService {

  private _leftSideBarToggle    = new BehaviorSubject<any>(null);
  public  leftSideBarToggle$    = this._leftSideBarToggle.asObservable();

  private _mainMenuSideBar   = new BehaviorSubject<any>(null);
  public mainMenuSideBar$    = this._mainMenuSideBar.asObservable();

  private _searchSideBar    = new BehaviorSubject<any>(null);
  public searchSideBar$     = this._searchSideBar.asObservable();

  private _searchBarWidth     = new BehaviorSubject<number>(null);
  public  _searchBarWidth$    = this._searchBarWidth.asObservable();

  private _barSize            = new BehaviorSubject<boolean>(null);
  public  barSize$            = this._barSize.asObservable();

  private _orderBar           = new BehaviorSubject<any>(null);
  public  orderBar$           = this._orderBar.asObservable();

  private _departmentMenu     = new BehaviorSubject<any>(null);
  public  departmentMenu$     = this._departmentMenu.asObservable();

  private _departmentID    = new BehaviorSubject<number>(null);
  public  departmentID$    = this._barSize.asObservable();
  departmentID: number;

  private barSize   : boolean;

  public  mainMenuSideBar   : boolean;
  private leftSideBarToggle        : boolean;
  public searchBar : boolean;
  public orderBar  : boolean;

  constructor() {
    this.mainMenuSideBar = false;
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

  updateleftSideBarToggle(value: boolean) {
    this._leftSideBarToggle.next(value)
    this.leftSideBarToggle = value;
  }

  updateBarSize(value: boolean) {
    if (!value) { this._barSize.next(true)}
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

  updateSideBar(value: boolean) {

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
    this.mainMenuSideBar = value
    this.searchBar = false;
    this._mainMenuSideBar.next(value);
    console.log(value, this.mainMenuSideBar)
    this._leftSideBarToggle.next(this.mainMenuSideBar);
    this.resizeWindow();
  }

  updateSearchBarSideBar(value: boolean) {
    this.searchBar = value
    this.mainMenuSideBar = false;
    this._mainMenuSideBar.next(value);
    this._leftSideBarToggle.next(this.searchBar);
    this.resizeWindow();
  }

  switchToolBarSideBar() {
    this.searchBar         = false;
    this.mainMenuSideBar   =  !this.mainMenuSideBar;

    // console.log('this.mainMenuSideBar', this.mainMenuSideBar)

    this._mainMenuSideBar.next(this.mainMenuSideBar);
    this._searchSideBar.next(false);

    this._leftSideBarToggle.next(this.mainMenuSideBar);
    this.updateBarSize(this.barSize)
    this.resizeWindow();
  }

  hidetoolBars() {
    this.updateSearchBarSideBar(false)
    this.updateOrderBar(false)
  }

  hideToolbarSearchBar() {
    this.searchBar = false
    this.mainMenuSideBar   = false
    this._searchSideBar.next(false)
    this._leftSideBarToggle.next(false);
    this._mainMenuSideBar.next(false);
    this.resizeWindow();
  }

  showSearchSideBar() {
    this.searchBar         = true
    this.mainMenuSideBar   = false
    this._searchSideBar.next(true)
    this._mainMenuSideBar.next(false);
    this._leftSideBarToggle.next(true);
     this.resizeWindow();
  }

  switchSearchBarSideBar() {

    if (!this.leftSideBarToggle ||
         this.leftSideBarToggle == undefined) {

      if (this.searchBar) {
        this.hideToolbarSearchBar();
        return
      }
      this.showSearchSideBar();
      return
    }

    if (this.searchBar) {
      if (this.mainMenuSideBar) {
        this._leftSideBarToggle.next(true)
        this._mainMenuSideBar.next(true)
        this._searchSideBar.next(false)
        this.resizeWindow();
        return
      }
      this.hideToolbarSearchBar();
      return
    }

    if (!this.mainMenuSideBar && this.searchBar) {
      this.showSearchSideBar();
      return
    }

    if (this.mainMenuSideBar && !this.searchBar) {
      this.showSearchSideBar();
      return
    }

    if (this.mainMenuSideBar && this.leftSideBarToggle) {
      this._leftSideBarToggle.next(true);
      this._mainMenuSideBar.next(false)
      this.resizeWindow();
      return
    }

    if (!this.mainMenuSideBar && !this.searchBar) {
      this.showSearchSideBar();
      return
    }

    if (this.searchBar) {
      this._leftSideBarToggle.next(false);
      this._mainMenuSideBar.next(false)
      this.resizeWindow();
      return
    }

  }

  showToolbarHideSearchBar() {
    this.searchBar = true;
    this.mainMenuSideBar   = true;
    this._searchSideBar.next(false)
    this._mainMenuSideBar.next(true);
    this.resizeWindow();
  }

}
