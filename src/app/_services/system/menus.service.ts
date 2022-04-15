import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, of, Subscription, } from 'rxjs';
import { ISite, IUser }   from 'src/app/_interfaces';
import { AccordionMenu, MenuGroup, SubMenu }  from 'src/app/_interfaces/index';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';

export interface ResultCheck {
  result: boolean;
  message: string;
}
@Injectable({
  providedIn: 'root'
})

export class MenusService {

  private _accordionMenu    = new BehaviorSubject<AccordionMenu>(null);
  public  accordionMenu$    = this._accordionMenu.asObservable();

  submenu = {} as SubMenu[]
  accordionMenus: AccordionMenu[] = [
    // {
    //   id:               0,
    //   name:             'Menu',
    //   icon:             'search',
    //   active:           true,
    //   sortOrder:        1,
    //   menuGroupID:      0,
    //   userType:         this.getAnonymous(),
    //   routerLink:       '/app-main-menu',
    //   routerLinkActive: 'app-main-menu',
    //   method:           '',
    //   submenus: [
    //     { name: 'Categories', minimized: false, method: '', routerLink: '/categories', routerLinkActive: 'categories', icon: 'article', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType:  this.getUsers(), meunyType: 0},
    //     { name: 'Brands',     minimized: false,  method: '', routerLink: '/brandslist',     routerLinkActive: 'brandslist',   icon: 'article',   onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType:  this.getUsers(), meunyType: 0},
    //     { name: 'Flowers',    minimized: true,  method: '',  routerLink: '/tier-menu',   routerLinkActive: 'tier-menu',   icon: 'yard',   onClick: '', id: 0, sortOrder: 3, submenuID:0, menuID: 0, submenus: this.submenu, userType:  this.getUsers(), meunyType: 0},
    //     { name: 'Search',     minimized: true,  method: '', routerLink: '/searchproducts',   routerLinkActive: 'searchproducts',   icon: 'search',   onClick: '', id: 4, sortOrder: 0, submenuID:0, menuID: 0, submenus: this.submenu, userType:  this.getUsers(), meunyType: 0},
    //   ]
    // },
    {
      id:             0,
      name:          'Profile',
      icon:          'face',
      active:        false,
      sortOrder:      2,
      menuGroupID:    0,
      userType:       this.getUsers(),
      routerLink:       '/app-profile',
      routerLinkActive: 'app-profile',
      method:           '',
      submenus: [
        { name: 'Profile',  minimized: false, method: '',  routerLink: '/app-profile', routerLinkActive: 'app-profile', icon: 'face', onClick: '', id: 0, sortOrder: 0, submenuID:1, menuID: 0, submenus: this.submenu, userType: this.getUsers(), meunyType: 0},
      ]
    },
    {
      id:             0,
      name:          'POS',
      icon:          'shopping_cart',
      active:        true,
      sortOrder:      2,
      menuGroupID:    0,
      userType:       this.getUsers(),
      routerLink:       '/pos-orders',
      routerLinkActive: 'pos-orders',
      method:           '',
      submenus: [
        { name: 'Orders',  minimized: false, method: '',  routerLink: '/pos-orders', routerLinkActive: 'pos-orders', icon: 'list', onClick: '', id: 0, sortOrder: 0, submenuID:1, menuID: 0, submenus: this.submenu, userType: this.getStaff(), meunyType: 0},
        { name: 'Payments',  minimized: false, method: '',  routerLink: '/pos-payments', routerLinkActive: 'pos-payments', icon: 'credit_card', onClick: '', id: 0, sortOrder: 0, submenuID:1, menuID: 0, submenus: this.submenu, userType: this.getStaff(), meunyType: 0},
        { name: 'Balance Sheets',  minimized: false, method: '',  routerLink: '/balance-sheets', routerLinkActive: 'balance-sheets', icon: 'list', onClick: '', id: 0, sortOrder: 0, submenuID:1, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Balance Sheet',  minimized: false, method: '',  routerLink: '/balance-sheet-edit', routerLinkActive: 'balance-sheet-edit', icon: 'point_of_sale', onClick: '', id: 0, sortOrder: 0, submenuID:1, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Operations',    minimized: false,  method: '' ,routerLink: '/operations', routerLinkActive: 'operations',   icon: 'article',   onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Tables' ,   minimized: false,  method: '' ,  routerLink: '/table-layout',     routerLinkActive: 'pos-orders',   icon: 'flatware',   onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getStaff(), meunyType: 0},
      ]
    },
    {
      id:           0,
      name:         'Contacts',
      icon:         'person_search',
      active:       true,
      menuGroupID:  0,
      sortOrder:    3,
      userType:     this.getManagers(),
      routerLink:       '/profileListing',
      routerLinkActive: 'profileListing',
      method: '' ,
      submenus: [
        { name: 'Find Profile',    method: '' ,minimized: true, routerLink: '/profileListing', routerLinkActive: 'profileListing', icon: 'person_search', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getStaff(), meunyType: 0},
        { name: 'Scan',            method: '' ,minimized: true, routerLink: '/barcodescanner', routerLinkActive: 'barcodescanner', icon: 'qr_code_scanner', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getStaff(), meunyType: 0},
        { name: 'Employees',       method: '' ,minimized: true, routerLink: '/employee-list',  routerLinkActive: 'employee-list',  icon: 'groups', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
      ]
    },
    {
      id:           0,
      name:         'Reporting',
      icon:         'bar_chart',
      active:       true,
      sortOrder:    4,
      menuGroupID:  0,
      userType:     this.getManagers(),
      routerLink:       '/dashboard',
      routerLinkActive: 'dashboard',
      method: '' ,
      submenus: [
        { name: 'Dashboard',  minimized: false,  method: '' ,routerLink: '/dashboard',     routerLinkActive: 'dashboard', icon: 'bar_chart', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Reports',    minimized: false,  method: '' ,routerLink: '/reports',       routerLinkActive: 'reports',   icon: 'article',   onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
      ]
    },

    // {
    //   id:           0,
    //   name:         'Sales',
    //   icon:         'money',
    //   sortOrder:     5,
    //   active:       true,
    //   menuGroupID:  0,
    //   userType:     this.getManagers(),
    //   routerLink:       '/pos-order-search',
    //   routerLinkActive: 'pos-order-search',
    //   method: '' ,
    //   submenus: [
    //     { name: 'POS Orders',   minimized: false,  method: '' , routerLink: '/pos-order-search', routerLinkActive: 'pos-order-search', icon: 'list', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
    //     { name: 'Order History',minimized: true, method: '' ,routerLink: '/pos-order-search', routerLinkActive: 'pos-order-search', icon: 'list', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
    //     { name: 'Payments',     minimized: true, method: '' ,  routerLink: '/pos-order-search', routerLinkActive: 'pos-order-search', icon: 'list', onClick: '', id: 0, sortOrder: 3, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
    //     { name: 'Items',        minimized: true, method: '' ,   routerLink: '/pos-order-search', routerLinkActive: 'pos-order-search', icon: 'list', onClick: '', id: 0, sortOrder: 4, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
    //   ]
    // },
    {
      id:     0,
      name: 'Metrc',
      icon: 'list',
      active: true,
      sortOrder: 6,
      menuGroupID:  0,
      userType:     this.getManagers(),
      routerLink:       '/package-list',
      routerLinkActive: 'package-list',
      method: '' ,
      submenus: [
        { name: 'METRC Sales',minimized: false, method: '' , routerLink: '/metrc-sales', routerLinkActive: 'metrc-sales', icon: 'list', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Packages',   minimized: false, method: '' ,routerLink: '/package-list', routerLinkActive: 'package-list', icon: 'download', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Facilites',  minimized: true, method: '' , routerLink: '/metrc-facilities-list', routerLinkActive: 'metrc-facilities-list', icon: 'add_business', onClick: '', id: 0, sortOrder: 3, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Categories', minimized: true, method: '' , routerLink: '/metrc-categories-list', routerLinkActive: 'metrc-categories-list', icon: 'list', onClick: '', id: 0, sortOrder: 4, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
       ]
    },
    {
      id:            0,
      name: 'Inventory',
      icon: 'inventory',
      active: true,
      sortOrder:     7,
      menuGroupID:   0,
      userType:     this.getManagers(),
      routerLink:       '/inventory-list',
      routerLinkActive: 'inventory-list',
      method: '' ,
      submenus: [
        { name: 'Inventory',  minimized: false, method: '' , routerLink: '/inventory-list',      routerLinkActive: 'inventory-list',      icon: 'list', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Locations',  minimized: true, method: '' , routerLink: '/inventory-locations', routerLinkActive: 'inventory-locations', icon: 'location', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
      ]
    },
    {
      id:           0,
      name:         'Catalog',
      icon:         'toc',
      active:       true,
      menuGroupID:  0,
      sortOrder:    8,
      userType:     this.getManagers(),
      routerLink:       '/product-list-view',
      routerLinkActive: 'product-list-view',
      method: '' ,
      submenus: [
        { name: 'Types',          method: '' ,  minimized: true, routerLink: '/item-types',            routerLinkActive: 'item-types', onClick: 'settings_applications', icon: 'list', id: 5, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Categories',     method: '' ,  minimized: true, routerLink: '/categorieslistview',    routerLinkActive:  'categorieslistview', icon: 'list', onClick: '', id: 0, sortOrder: 3, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Items',          method: '' ,  minimized: false,routerLink: '/product-list-view',     routerLinkActive:  'product-list-view', icon: 'list', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Brands',         method: '' ,  minimized: true, routerLink: '/adminbrandslist',       routerLinkActive:  'adminbrandslist', icon: 'list', onClick: '', id: 0, sortOrder: 4, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Price Categories',method: '' , minimized: true, routerLink: '/price-categories' ,     routerLinkActive: 'price-categories', icon: 'price_change', onClick: '', id: 0, sortOrder: 5, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Catalog Schedule', method: '' ,  minimized: true, routerLink: '/price-schedule' ,       routerLinkActive: 'price-schedule', icon: 'price_change', onClick: '', id: 0, sortOrder: 5, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Price Tiers',    method: '' ,  minimized: true, routerLink: '/price-tier-list-edit' ,       routerLinkActive: 'price-schedule', icon: 'price_change', onClick: '', id: 0, sortOrder: 5, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Unit Types',     method: '' ,  minimized: true, routerLink: '/unit-types',            routerLinkActive: 'unit-types', onClick: '', icon: 'list', id: 0, sortOrder: 5, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Tax Rates',      method: '' ,  minimized: true, routerLink: '/taxes' ,                routerLinkActive: 'taxes', icon: 'price_change', onClick: '', id: 0, sortOrder: 6, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Flat Tax',       method: '' ,  minimized: true, routerLink: '/flat-rate-taxes',       routerLinkActive: 'flat-rate-taxes', onClick: '', icon: 'list', id: 0, sortOrder: 7, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Print Locations',method: '' ,  minimized: true, routerLink: '/printer-locations',     routerLinkActive: 'printer-locations', onClick: '', icon: 'printer', id: 0, sortOrder: 7, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Prompts & Kits', method: '' ,  minimized: true, routerLink: '/prompt-kits',          routerLinkActive: 'speaker-group', onClick: '', icon: 'kit', id: 0, sortOrder: 7, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
      ]
    },
    {
      id:             0,
      name:          'Dashboard',
      icon:          'dashboard',
      active:        true,
      sortOrder:      2,
      menuGroupID:    0,
      userType:       this.getUsers(),
      routerLink:       '/menu-board',
      routerLinkActive: 'menu-board',
      method:           '',
      submenus: [ ]
    },
    {
      id:        0,
      name:     'Settings',
      icon:     'settings',
      active:    true,
      sortOrder  : 15,
      menuGroupID:  0,
      userType:     this.getManagers(),
      routerLink:   '/app-settings',
      routerLinkActive: 'settings',
      method: '' ,
      submenus: [
        { name: 'Settings', method: '' ,minimized: true,routerLink: '/app-settings', routerLinkActive: 'settings', icon: 'list', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Sites',    method: '' ,minimized: true, routerLink: '/site-edit', routerLinkActive: 'site-edit', icon: 'list', onClick: '', id: 0, sortOrder: 2, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        { name: 'Terminals',method: '' ,minimized: true, routerLink: '/pos-list', routerLinkActive: 'pos-list', icon: 'computer', onClick: '', id: 0, sortOrder: 3, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
      ]
    },
  ] ;

  user              : IUser;
  _user             : Subscription;

  initSubscription() {
    this._user = this.auth.user$.subscribe( data => {
      this.user  = data
    })
  }

  constructor( private http: HttpClient,
               private httpCache: HttpClientCacheService,
               private auth: AuthenticationService, ) {
                 this.initSubscription();
               }

  updateAccordionMenuSubscription(accordionMenu: AccordionMenu) {
    this._accordionMenu.next(accordionMenu)
  }
  getAnonymous(): string {
    return 'admin,manager,user,employee,anonymous'
  }

  getUsers(): string {
    return 'admin,manager,user,employee'
  }

  getStaff(): string {
    return 'admin,manager,employee'
  }

  getManagers(): string {
    return 'admin,manager'
  }

  getMenu(site: ISite, menuName: string): Observable<AccordionMenu[]> {

      const user = JSON.parse(localStorage.getItem('user')) as IUser;
      if (!user || !user.token || !user.token || user.token == '' ) { return of(null)}

      if (!user || !user.roles ||  !user.username ) {
        return of(null)
      }

      const controller = "/MenuGroups/"

      const endPoint = 'GetMenuGroupByName';

      const parameters = `?name=${menuName}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<AccordionMenu[]>(url)

    }

  getMainMenu(site: ISite): Observable<AccordionMenu[]> {
     return this.getMenu(site, 'main')
  }

  //PutSubMenuGrouplist

  putSubMenuGrouplist(site: ISite, submenu: SubMenu[]): Observable<SubMenu[]> {

    const controller = "/MenuGroups/"

    const endPoint = 'PutSubMenuGrouplist';

    const parameters = `?menuID=${submenu[0].menuID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<SubMenu[]>(url, submenu)

  }

  putAccordionMenulist(site: ISite, accordionMenu: AccordionMenu[]): Observable<AccordionMenu[]> {

    const controller = "/MenuGroups/"

    const endPoint = 'putAccordionMenulist';

    const parameters = `?menuGroupID=${accordionMenu[0].menuGroupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<AccordionMenu[]>(url, accordionMenu)

  }

  mainMenuExists(site: ISite): Observable<ResultCheck> {

    const controller = "/MenuGroups/"

    const endPoint = 'MenuExists';

    const parameters = `?name=main`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return this.http.get<ResultCheck>(uri);

  }

  menuExists(site: ISite, name: string): Observable<ResultCheck> {

    const controller = "/MenuGroups/"

    const endPoint = 'MenuExists';

    const parameters = `?name=${name}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 120}

    return  this.httpCache.get<ResultCheck>(url)

  }

  createMainMenu(user: IUser, site: ISite): Observable<MenuGroup> {

    if (!user) {
      return null
    }

    if (this.user.roles != 'admin') { return }

    const  menuGroup =  {name: 'main', id: 0, userType: this.getUsers(), accordionMenus: this.accordionMenus }  as MenuGroup;

    const controller = "/MenuGroups/"

    const endPoint = 'PostMenuGroup';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}`

    return this.http.post<MenuGroup>(url, menuGroup)
  }

  deleteMenu(site: ISite): Observable<MenuGroup> {

    const controller = "/MenuGroups/"

    const endPoint = 'DeleteMenu';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<MenuGroup>(url)
  }

  deleteMenuGroup(site: ISite, id: number): Observable<MenuGroup> {

    const controller = "/MenuGroups/"

    const endPoint = 'deleteMenuGroup';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<MenuGroup>(url )
  }

  getAccordionMenuByID(site: ISite, id: number): Observable<AccordionMenu> {
    const controller = "/MenuGroups/"

    const endPoint = 'getAccordionMenuByID';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<AccordionMenu>(url)
  }

  getMenuByID(site: ISite, id: number): Observable<MenuGroup> {
    const controller = "/MenuGroups/"

    const endPoint = 'getMenuByID';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<MenuGroup>(url)
  }

  getSubMenuByID(site: ISite, id: number): Observable<SubMenu> {
    const controller = "/MenuGroups/"

    const endPoint = 'getSubMenuByID';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<SubMenu>(url)
  }

  postAccordionMenu(site: ISite,  accordionMenu: AccordionMenu): Observable<AccordionMenu> {
    const controller = "/MenuGroups/"

    const endPoint = 'PostAccordionMenu';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<AccordionMenu>(url, accordionMenu)
  }
  putAccordionMenuByID(site: ISite, id: number, accordionMenu: AccordionMenu): Observable<AccordionMenu> {
    const controller = "/MenuGroups/"

    const endPoint = 'putAccordionMenuByID';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<AccordionMenu>(url, accordionMenu)
  }

  putMenuByID(site: ISite, id: number, menuGroup: MenuGroup): Observable<MenuGroup> {
    const controller = "/MenuGroups/"

    const endPoint = 'putMenuByID';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<MenuGroup>(url, menuGroup)
  }

  putSubMenuByID(site: ISite, id: number, subMenu: SubMenu): Observable<SubMenu> {

    const controller = "/MenuGroups/"

    const endPoint = 'putSubMenuByID';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<SubMenu>(url, subMenu)
  }

  postSubMenuItem(site: ISite, subMenu: SubMenu): Observable<SubMenu> {

    const controller = "/MenuGroups/"

    const endPoint = 'PostSubMenuItem';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<SubMenu>(url, subMenu)
  }


  getDefaultMenuData() {
    return
  }

}
