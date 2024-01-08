import { XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
// import { InterceptorSkipHeader } from 'src/app/_http-interceptors/basic-auth.interceptor';
import { AuthenticationService, IItemBasic } from '..';
import { ISite } from 'src/app/_interfaces';
import { Router } from '@angular/router';
import { SitesService } from '../reporting/sites.service';
import { EbayConditions } from './ebayConditions';
export const InterceptorSkipHeader = 'X-Skip-Interceptor';
export interface EbayResponse {
  errors: ResponseError[];
  success: boolean;
  responseMessage: string;
  errorMessage: string;
  errorCode: string;
}

export interface ResponseError {
  // Define the properties of responseErrors here
  // Example:
  // code: string;
  // message: string;
}
export interface CategorySuggestion {
  category: EbayCategorySuggestion;
  categoryTreeNodeLevel: number;
  categoryTreeNodeAncestors: CategoryTreeNodeAncestor[];
}

export interface EbayCategorySuggestion {
  categoryId: string;
  categoryName: string;
}

export interface CategoryTreeNodeAncestor {
  categoryId: string;
  categoryName: string;
  categoryTreeNodeLevel: number;
  categorySubtreeNodeHref: string;
}

export interface CategorySuggestionsResponse {
  categorySuggestions: CategorySuggestion[];
  categoryTreeId: string;
  categoryTreeVersion: string;
}

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
  //packageType should be here but isent'
  weight: Weight;
}

export interface Product {
  description: string;
  imageUrls: string[];
  title: string;
  aspects: any
}

export interface ProductData {
  availability: {
    shipToLocationAvailability: ShipToLocationAvailability;
  };
  condition: string;
  packageWeightAndSize: PackageWeightAndSize;
  packageType: string;
  product: Product;
}

export interface condition {
  condtion: string;
}

export interface EbayOfferRequest {
  sku: string;
  marketplaceId: string;
  format: string;
  listingDescription: string;
  categoryId: string;
  availableQuantity: number; // Assuming availableQuantity is a number
  quantityLimitPerBuyer: number; // Assuming quantityLimitPerBuyer is a number
  pricingSummary: {
      price: {
          value: string;
          currency: string;
      };
  };
  listingPolicies: {
      fulfillmentPolicyId: string;
      paymentPolicyId: string;
      returnPolicyId: string;
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
  offerPublishStatus  : boolean;
  listingid: string;
  ebayCategory: any;
  status: string;
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
 


  ebayMarketplaceIds: string[] = [
    "EBAY_AT", "EBAY_AU", "EBAY_BE", "EBAY_CA", "EBAY_CH", "EBAY_CN", "EBAY_CZ",
    "EBAY_DE", "EBAY_DK", "EBAY_ES", "EBAY_FI", "EBAY_FR", "EBAY_GB", "EBAY_GR",
    "EBAY_HK", "EBAY_HU", "EBAY_ID", "EBAY_IE", "EBAY_IL", "EBAY_IN", "EBAY_IT",
    "EBAY_JP", "EBAY_MY", "EBAY_NL", "EBAY_NO", "EBAY_NZ", "EBAY_PE", "EBAY_PH",
    "EBAY_PL", "EBAY_PR", "EBAY_PT", "EBAY_RU", "EBAY_SE", "EBAY_SG", "EBAY_TH",
    "EBAY_TW", "EBAY_US", "EBAY_VN", "EBAY_ZA", "EBAY_HALF_US", "EBAY_MOTORS_US"
  ];
  shippingTypes: string[] = [
    "BulkyGoods",
    "Caravan",
    "Cars",
    "CustomCode",
    "Europallet",
    "ExpandableToughBags",
    "ExtraLargePack",
    "Furniture",
    "IndustryVehicles",
    "LargeCanadaPostBox",
    "LargeCanadaPostBubbleMailer",
    "LargeEnvelope",
    "Letter",
    "MailingBoxes",
    "MediumCanadaPostBox",
    "MediumCanadaPostBubbleMailer",
    "Motorbikes",
    "None",
    "OneWayPallet",
    "PackageThickEnvelope",
    "PaddedBags",
    "ParcelOrPaddedEnvelope",
    "Roll",
    "SmallCanadaPostBox",
    "SmallCanadaPostBubbleMailer",
    "ToughBags",
    "UPSLetter",
    "USPSFlatRateEnvelope",
    "USPSLargePack",
    "VeryLargePack",
    "Winepak"
  ];

  //return policy
  conditionEnum : string[] = ["NEW", "LIKE_NEW", "NEW_OTHER", "NEW_WITH_DEFECTS", "PRE_OWNED", "NEW_WITH_TAGS", "NEW_WITHOUT_TAGS","NEW_WITH_BOX","NEW_WITHOUT_BOX", "MANUFACTURER_REFURBISHED", "CERTIFIED_REFURBISHED", "EXCELLENT_REFURBISHED", "VERY_GOOD_REFURBISHED", "GOOD_REFURBISHED", "SELLER_REFURBISHED", "USED_EXCELLENT", "USED_VERY_GOOD", "USED_GOOD", "USED_ACCEPTABLE", "FOR_PARTS_OR_NOT_WORKING"]
  shippingCostTypeEnum : string[] = ['CALCULATED','FLAT_RATE,NOT_SPECIFIED']
  categoryTypeEnum : string[] = ['MOTORS_VEHICLES','ALL_EXCLUDING_MOTORS_VEHICLES']
  returnMethodEnum: string[] = ['EXCHANGE','REPLACEMENT'];
  timeDurationUnitEnum : string[] = ['YEAR','MONTH','DAY','HOUR','CALENDAR_DAY','BUSINESS_DAY','MINUTE','SECOND','MILLISECOND'];
  returnShippingCostPayerEnum =  ['BUYER','SELLER'];
  currencyCodeEnum : string[] = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYR", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "STD", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VEF", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL"];
  shippingOptionTypeEnum : string[] = ['DOMESTIC','INTERNATIONAL']

  regionTypeEnum : string[] = ['COUNTRY','COUNTRY_REGION','STATE_OR_PROVINCE','WORLD_REGION','WORLDWIDE']

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
              private siteSerivce: SitesService,
              private authenticationService: AuthenticationService) { }


    publishPolicy(site: ISite, policy: string) {
      const controller = "/Ebay/"

      const endPoint = `checkInventory`

      const parameters = `?policyName=${policy}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }
  
    getPOSLocation(site: ISite) {
      const controller = "/Ebay/"

      const endPoint = `getPOSLocation`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }

    getConditions(site: ISite, path: string, value: string): Observable<EbayResponse> {
      const controller = "/Ebay/"

      const endPoint = `getConditions`

      const parameters = `?url=${path}&categoryID=${value}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }
    
    getAsync(site: ISite, path: string) {
      const controller = "/Ebay/"

      const endPoint = `getAsync`

      const parameters = `?endPoint=${path}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }

    //marketplace_id As String, productDescription As String
    getCateogries(site: ISite, marketplace_id: string, productDescription: string): Observable<CategorySuggestionsResponse> {
      const controller = "/Ebay/"

      const endPoint = `getCateogries`

      const parameters = `?marketplace_id=${marketplace_id}&productDescription=${productDescription}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url).pipe(switchMap(data => 
        {
          if (data?.success) { 
            const list = JSON.parse(data.responseMessage) as CategorySuggestionsResponse;
            if (list)  {
              return of(list)
            }
          }
          if (!data.errorMessage) { 
            this.siteSerivce.notify('Error' + data.errorMessage.toString(), 'Close', 60000, 'Red' )
          }
          return of(data)
        }
      ))
    }


    listPolicies(site: ISite, policy: string) {
      const controller = "/Ebay/"

      const endPoint = `listPolicies`

      const parameters = `?policyName=${policy}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }
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
    }

    //checks status of existing offer.
    //https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/{SKU}
    //put
    public checkOfferStatus(site: ISite, id: number, offerID : string): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `checkOfferStatus`

      const parameters = `?id=${id}&offerID=${offerID}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }

    //https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/{SKU}
    //get
    public getInventoryItem(sku: string): Observable<ProductData> {

      return of(null)
    }

    // https://api.sandbox.ebay.com/sell/inventory/v1/offer
    //post


    //https://api.sandbox.ebay.com/sell/inventory/v1/offer/{offerId}
    //get
    public getOffer(offerId: string): Observable<any> {

      return of(null)
    }

    // https://api.sandbox.ebay.com/sell/inventory/v1/offer/{offerId}/publish
    //post
    public publishOfferBy(site:ISite, offerID: string, id: number) {
      const controller = "/Ebay/"

      const endPoint = `publishOfferBy`

      const parameters = `?offerID=${offerID}&id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }

    public  createOffer(site:ISite, id: number): Observable<any> {
      const controller = "/Ebay/"

      const endPoint = `createOffer`

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<any>(url)
    }

}
