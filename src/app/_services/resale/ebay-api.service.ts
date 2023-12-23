import { XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
// import { InterceptorSkipHeader } from 'src/app/_http-interceptors/basic-auth.interceptor';
import { AuthenticationService, IItemBasic } from '..';
import { ISite } from 'src/app/_interfaces';
import { Router } from '@angular/router';
export const InterceptorSkipHeader = 'X-Skip-Interceptor';
export enum AvailabilityTypeEnum {
  IN_STOCK,
  OUT_OF_STOCK,
  SHIP_TO_STORE
}

export enum TimeDurationUnitEnum {
  YEAR,
  MONTH,
  DAY,
  HOUR,
  CALENDAR_DAY,
  BUSINESS_DAY,
  MINUTE,
  SECOND,
  MILLISECOND
}


export enum ConditionEnum {
  New,
  LIKE_NEW,
  // ... other conditions
}

export enum LengthUnitOfMeasureEnum {
  INCH,
  FEET,
  CENTIMETER,
  METER
}

export enum PackageTypeEnum {
  LETTER,
  BULKY_GOODS,
  WINE_PAK,
  // ... other package types
}

export enum WeightUnitOfMeasureEnum {
  POUND,
  KILOGRAM,
  OUNCE,
  GRAM
}

export interface FulfillmentTime {
  unit: TimeDurationUnitEnum;
  value: number;
}

export interface PickupAtLocationAvailability {
  availabilityType: AvailabilityTypeEnum;
  fulfillmentTime: FulfillmentTime;
  merchantLocationKey: string;
  quantity: number;
}

export interface ShipToLocationAvailabilityDistribution {
  fulfillmentTime: FulfillmentTime;
  merchantLocationKey: string;
  quantity: number;
}

export interface ShipToLocationAvailability {
  availabilityDistributions: ShipToLocationAvailabilityDistribution[];
  quantity: number;
}

export interface ConditionDescriptor {
  additionalInfo: string;
  name: string;
  values: string[];
}

export interface Dimensions {
  height: number;
  length: number;
  unit:   string;
  width: number;
}

export interface Weight {
  unit: string;
  value: number;
}

export interface PackageWeightAndSize {
  dimensions: Dimensions;
  packageType: string;
  weight: Weight;
}

export interface Product {
  description: string;
  imageUrls: string[];
  title: string;
}

export interface ProductData {
  availability: {
    shipToLocationAvailability: ShipToLocationAvailability;
  };
  condition: string;
  packageWeightAndSize: PackageWeightAndSize;
  product: Product;
}

export interface EbayOfferRequest {
  sku: string;
  marketplaceId: string;
  format: string;
  listingDescription: string;
  availableQuantity: number; // Assuming availableQuantity is a number
  quantityLimitPerBuyer: number; // Assuming quantityLimitPerBuyer is a number
  pricingSummary: {
      price: {
          value: number;
          currency: string;
      };
  };
  listingPolicies: {
      fulfillmentPolicyId: string;
      paymentPolicyId: string;
      returnPolicyId: string;
  };
  categoryId: string;
  merchantLocationKey: string;
  tax: {
      vatPercentage: number;
      applyTax: boolean;
      thirdPartyTaxCategory: string;
  };
}

export interface EbayOfferresponse  {
  offerId: string;
}


export interface ebayHeaders {
  devName: string;
  appName : string;
  certName: string;
  callName: string;
  siteId: String;
  id: number;
}

export interface EbayInventoryJson {
  inventory           : ProductData;
  inventoryPublished  : boolean;
  offerRequest        : EbayOfferRequest;
  offerResponse       : EbayOfferresponse;
  ebayPublishResponse : any;
}

export interface ebayoAuthorization {
  brandedoAuthLink: string;
  devName: string;
   sandBox: boolean;
   token: string;
   appName: string
   client_secret: string;
   clientID: string;
   rUName: string;
   oAuthUserToken: string;
   access_token: string;
   refresh_token: string;
   ebayAuthLink: string;
   id: number;
}


@Injectable({
  providedIn: 'root'
})
export class EbayAPIService {


  navEbayAuth(link) {
    // throw new Error('Method not implemented.');
    this.router.navigateByUrl(link)
  }

  get scope() {return 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/buy.order.readonly https://api.ebay.com/oauth/api_scope/buy.guest.order https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly https://api.ebay.com/oauth/api_scope/buy.shopping.cart https://api.ebay.com/oauth/api_scope/buy.offer.auction https://api.ebay.com/oauth/api_scope/commerce.identity.readonly https://api.ebay.com/oauth/api_scope/commerce.identity.email.readonly https://api.ebay.com/oauth/api_scope/commerce.identity.phone.readonly https://api.ebay.com/oauth/api_scope/commerce.identity.address.readonly https://api.ebay.com/oauth/api_scope/commerce.identity.name.readonly https://api.ebay.com/oauth/api_scope/commerce.identity.status.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.item.draft https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/sell.item https://api.ebay.com/oauth/api_scope/sell.reputation https://api.ebay.com/oauth/api_scope/sell.reputation.readonly https://api.ebay.com/oauth/api_scope/commerce.notification.subscription https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly'}


  private get apiBase() {return 'https://api.ebay.com/ws/api.dll'}
  private get apiSandBox()  {return 'https://api.sandbox.ebay.com/ws/api.dll'}

  get oAuthSandbox()	{ return 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'}
  get oAuthProduction()  {return 'https://api.ebay.com/identity/v1/oauth2/token'}

  constructor(private http: HttpClient,
              private router: Router,
              private authenticationService: AuthenticationService) { }




    // const headers = new HttpHeaders().set(InterceptorSkipHeader, '');
    // const req = new HttpRequest(
    //   'PUT', url, file,
    //   {  headers: headers,  });
    // return this.http.request(req);
    uploadFile(file:File , url: string): Observable<any> {
      const headers = new HttpHeaders().set(InterceptorSkipHeader, '');
      return this.http.put<any>( url, file, {headers} )
      // return this.http.put<any>( url, file )
    }

//    const parameters = `?departmentID=${departmentID}&attribute=${attribute}&gender=${gender}`
    checkInventory(site: ISite, sku: string): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `checkInventory`

      const parameters = `?sku=${sku}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      console.log(url)
      return this.http.get<any>(url)

    }

    deleteOfferByID(site: ISite, id: number): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `deleteOfferByID`

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      console.log(url)
      return this.http.get<any>(url)

    }

    deleteInventoryItem(site: ISite, id: number): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `deleteInventoryItem`

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)

    }

    createInventoryLocation(site: ISite): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `createInventoryLocation`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      console.log(url)
      return this.http.get<any>(url)

    }


    public testPublish(site: ISite) {

      const controller = "/Ebay/"

      const endPoint = `testPostItem`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)

    }

    public getRefreshToken(site: ISite) {

      const controller = "/Ebay/"

      const endPoint = `getRefreshToken`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)

    }


    public applyAuthResponse(site: ISite, token: string) {

      const controller = "/Ebay/"

      const endPoint = `applyAuthResponse`

      const parameters = ``

      let item = {} as IItemBasic;
      item.name = token;

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.post<any>(url, item)

    }

    //publishs to inventory. then does a check to see that the item exists
    //https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/{SKU}
    //put
    public createOrReplaceInventoryItem(site: ISite, sku, item: ProductData): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `createOrReplaceInventoryItem`

      const parameters = `?sku=${sku}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.post<any>(url, item)
      return of(null)
    }

    //https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/{SKU}
    //get
    public getInventoryItem(sku: string): Observable<ProductData> {

      return of(null)
    }

    // https://api.sandbox.ebay.com/sell/inventory/v1/offer
    //post
    public  createOffer(item: EbayOfferRequest): Observable<any> {

      return of(null)
    }

    //https://api.sandbox.ebay.com/sell/inventory/v1/offer/{offerId}
    //get
    public getOffer(offerId: string): Observable<any> {

      return of(null)
    }

    // https://api.sandbox.ebay.com/sell/inventory/v1/offer/{offerId}/publish
    //post
    public publishOffer(site:ISite, id: number) {
      const controller = "/Ebay/"

      const endPoint = `publishOffer`

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }

}
