import { Injectable } from '@angular/core';
import { IProduct } from 'src/app/_interfaces';

@Injectable({
  providedIn: 'root'
})
export class MenuProductPriceService {
 product: IProduct
  constructor() { }
}
