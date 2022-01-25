
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISite, UnitType } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';

// Generated by https://quicktype.io

export interface ITVMenuPriceTiers {
  id:                   number;
  name:                 string;
  uID:                  string;
  webEnabled:           number;
  tvMenuPriceTierItems: TVMenuPriceTierItem[];
}

export interface TVMenuPriceTierItem {
  id:                  number;
  quantityValue:       string;
  quantityDescription: string;
  rate1:               number;
  rate2:               number;
  rate3:               number;
  rate4:               number;
  rate5:               number;
  rate6:               number;
  currentPrice:        number;
  startTime:           string;
  endTime:             string;
  daysOfWeek:          string;
  priceTier:           number;
  standardPrice:       number;
  specialRate:         number;
}

export interface IFlowerMenu {
  id         : number;
  flower     : string;
  priceTier  : string;
  priceTierID: number;
}

@Injectable({
  providedIn: 'root'
})
export class TvMenuPriceTierService {

  private _tier = new BehaviorSubject<ITVMenuPriceTiers>(null);
  public tier$  = this._tier.asObservable();

  private _tierFlowerMenu = new BehaviorSubject<IFlowerMenu>(null);
  public tierFlowerMenu$  = this._tierFlowerMenu.asObservable();


  updateTier(tier: ITVMenuPriceTiers){
    this._tier.next(tier)
  }

  updateTierFlowerMenu(tier: IFlowerMenu){
    this._tierFlowerMenu.next(tier)
  }


  constructor( private http: HttpClient,
               private auth: AuthenticationService,
             ) {}

  getTVMenuPriceTiers(site: ISite):  Observable<ITVMenuPriceTiers[]>  {

    const controller =  `/TVMenuPriceTiers/`

    const endPoint = `GetPriceTiers`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ITVMenuPriceTiers[]>(url)

  }

  getFlowers(site: ISite):  Observable<IFlowerMenu[]>  {

    const controller =  `/TVMenuPriceTiers/`

    const endPoint = `GetFlowers`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IFlowerMenu[]>(url)

  }

  getPriceTierByID(site: ISite, id: number):  Observable<ITVMenuPriceTiers>  {

    const controller =  `/TVMenuPriceTiers/`

    const endPoint = `GetFlowers?id=${id}`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ITVMenuPriceTiers>(url)

  }

}
