import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})

export class FbContactsService {

  constructor(private _fb: FormBuilder) { }

  initForm(fb: FormGroup): FormGroup {

      fb = this._fb.group({
        id: [''], //                       number;
        companyName: [''], //              string;
        firstName: [''], //                string;
        lastName: [''], //                 string;
        email: [''], //                    string;
        accountNumber: [''], //            string;
        shippingAddress2: [''], //         string;
        shippingAddress: [''], //          string;
        city: [''], //                     string;
        state: [''], //                    string;
        zip: [''], //                      string;
        billingAddress: [''], //           string;
        billingAddress2: [''], //          string;
        billingCity: [''], //              string;
        billingState: [''], //             string;
        billingZIp: [''], //               string;
        dlAddress: [''], //                string;
        dlAddress2: [''], //               string;
        dlCity: [''], //                   string;
        dlState: [''], //                  string;
        dlZip: [''], //                    string;
        dlExp: [''], //                    string;
        clientTypeID: [0], //             number;
        priceTier: [''], //                number;
        taxSales: [''], //                 number;
        dob: [''], //                      string;
        followUp: [''], //                 string;
        initialDate: [''], //              string;
        loyaltyPoints: [''], //            number;
        loyaltyPurchaseCount: [''], //     number;
        totalPurchases: [''], //           number;
        currentPurchases: [''], //         number;
        notes: [''], //                    string;
        status: [0], //                   number;
        fax: [''], //                      string;
        webSite: [''], //                  string;
        logon: [''], //                    string;
        password: [''], //                 string;
        contact: [''], //                  string;
        discount: [''], //                 number;
        termsFile: [''], //                string;
        taxID: [''], //                    string;
        frequentBuyerTotal: [''], //       number;
        crossStreet: [''], //              string;
        phone: [''], //                    string;
        clientIDCard: [''], //             string;
        prefix: [''], //                   string;
        title: [''], //                    string;
        middleName: [''], //               string;
        suffix: [''], //                   string;
        country: [''], //                  string;
        defaultDiscount: [''], //          number;
        rep: [''], //                      number;
        isDeleted: [''], //                boolean;
        homePhone: [''], //                string;
        cellPhone: [''], //                string;
        otherPhone: [''], //               string;
        businessPhone: [''], //            string;
        jobTitle: [''], //                 string;
        source: [''], //                   number;
        ccNum: [''], //                    string;
        ccexp: [''], //                    string;
        ccSec: [''], //                    string;
        invoiceCustomer: [''], //          boolean;
        communicableDisease: [''], //      string;
        primaryDocID: [''], //             number;
        salesRepID: [''], //               number;
        operationsRepID: [''], //          number;
        billingRepID: [''], //             number;
        securityQuestion: [''], //         string;
        securityAnswer: [''], //           string;
        gender: [''], //                   number;
        height: [''], //                   number;
        weight: [''], //                   number;
        lastContact: [''], //              string;
        salesManagerID: [''], //           number;
        salesManagerName: [''], //         string;
        socialSecurity: [''], //           string;
        dx: [''], //                       string;
        firstContactReason: [''], //       string;
        salesRepName: [''], //             string;
        employeerName: [''], //            string;
        employeerPhone: [''], //           string;
        lastAccessed: [''], //             string;
        lastAccessedUserID: [''], //       number;
        specialty: [''], //                string;
        sex: [''], //                      string;
        statusName: [''], //               string;
        fedTaxID: [''], //                 string;
        stateTaxID: [''], //               string;
        dba: [''], //                      string;
        displayDiscountsOnOrders: [''], // number;
        shipVia: [''], //                  number;
        termsLength: [''], //              number;
        shippingCounty: [''], //           string;
        preventSubPromptModifier: [''], // number;
        tipDefault: [''], //               number;
        versionNumber: [''], //            string;
        lastModified: [''], //             string;
        clientUUID: [''], //               string;
        gramCountMonthly: [''], //         number;
        uid: [''], //                      string;
        apiPassword: [''], //              string;
        apiUserName: [''], //              string;
        roles: [''], //                    string;
        onlineDescriptionImage: [''], //   string;
        onlineDescription: [''], //        string;
        onlineDescriptionTag      : [''], //     string;
        employeeID                : [''], //               number;
        med                       : [''],
        dlNumber                  : [''],
        accountDisabled           : [''],
        accountLocked             : [''],
        accountDelay              : [''],
      })
    return fb
  }

}
