import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
export interface AddItemRequest {
  requesterCredentials: {
    eBayAuthToken: string;
  };
  errorLanguage: string;
  warningLevel: string;
  item: {
    title: string;
    description: string;
    primaryCategory: {
      categoryId: string;
    };
    startPrice: number;
    categoryMappingAllowed: boolean;
    country: string;
    currency: string;
    dispatchTimeMax: number;
    listingDuration: string;
    listingType: string;
    pictureDetails: {
      pictureURL: string;
    };
    postalCode: string;
    quantity: number;
    itemSpecifics: {
      nameValueList: NameValueList[];
    };
    returnPolicy: {
      returnsAcceptedOption: string;
      refundOption: string;
      returnsWithinOption: string;
      shippingCostPaidByOption: string;
    };
    shippingDetails: {
      shippingType: string;
      shippingServiceOptions: {
        shippingServicePriority: number;
        shippingService: string;
        shippingServiceCost: number;
      };
    };
    site: string;
  };
}

interface NameValueList {
  name: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class EbayAPI2Service {
  apiUrl: string;

  constructor(private http: HttpClient) { }

  getEbayOfficialTime(authToken: string, ebayHeaders ): Observable<any> {
    const headers = new HttpHeaders({
      'X-EBAY-API-COMPATIBILITY-LEVEL': '391',
      'X-EBAY-API-DEV-NAME': ebayHeaders.devName,
      'X-EBAY-API-APP-NAME': ebayHeaders.appName,
      'X-EBAY-API-CERT-NAME': ebayHeaders.certName,
      'X-EBAY-API-CALL-NAME': ebayHeaders.callName,
      'X-EBAY-API-SITEID': ebayHeaders.siteId,
      'Content-Type': 'text/xml'
    });

    const xmlRequest = `<?xml version='1.0' encoding='utf-8'?>
    <GeteBayOfficialTimeRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${authToken}</eBayAuthToken>
      </RequesterCredentials>
    </GeteBayOfficialTimeRequest>`;

    return this.http.post(this.apiUrl, xmlRequest, { headers, responseType: 'text' });
  }

  addSaleItemEbay_traditional(item: AddItemRequest ) {

    // const builder       = new XMLBuilder(null)
    // const xml           = builder.build(tstream);
    //convert to xml?
    //post
    return of(null)
  }
}
