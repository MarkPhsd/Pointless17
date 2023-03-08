import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { ISite, IUserProfile }   from  'src/app/_interfaces';
import { environment } from 'src/environments/environment';

export interface DriverData {
  DriverDataString: string;
}

export interface DLScanResults {
  id: number;
  message: string;
  errorMessage: string;
  result: boolean;
}
// Generated by https://quicktype.io

export interface IDriverLicenseResults {
  id:                        number;
  firstName:                 string;
  lastName:                  string;
  phone:                     null;
  zip:                       string;
  state:                     string;
  city:                      string;
  address:                   string;
  email:                     null;
  notes:                     null;
  loyaltyPoints:             null;
  loyaltyPurchaseCount:      null;
  clientUUID:                null;
  uid:                       null;
  clientTypeID:              null;
  totalPurchases:            null;
  initialDate:               null;
  lastAccessedDate:          null;
  company:                   null;
  accountNumber:             null;
  userName:                  null;
  cellPhone:                 null;
  apiPassword:               null;
  roles:                     null;
  onlineDescription:         null;
  onlineDescriptionImage:    null;
  onlineDescriptionTag:      null;
  dob:                       string;
  gender:                    null;
  followUpdateDate:          string;
  salesRepName:              null;
  statusname:                null;
  lasModifiedDate:           null;
  employeeID:                null;
  loyaltyPointValue:         number;
  careGiverCode:             null;
  contact:                   null;
  taxSales:                  null;
  priceColumn:               null;
  defaultPercentageDiscount: null;
  openOrderCount:            null;
  employee:                  null;
  clientType:                null;
  itemCount     :            number;
}


@Injectable({
  providedIn: 'root'
})
export class DlParserService {



DLAbbrDesMap = {
    'DCA': 'Jurisdiction-specific vehicle class',
    'DBA': 'Expiry Date',
    'DCS': 'Last Name',
    'DAC': 'First Name',
    'DBD': 'Issue Date',
    'DBB': 'Birth Date',
    'DBC': 'Gender',
    'DAY': 'Eye Color',
    'DAU': 'Height',
    'DAG': 'Street',
    'DAI': 'City',
    'DAJ': 'State',
    'DAK': 'Zip',
    'DAQ': 'License Number',
    'DCF': 'Document Discriminator',
    'DCG': 'Issue Country',
    'DAH': 'Street 2',
    'DAZ': 'Hair Color',
    'DCI': 'Place of birth',
    'DCJ': 'Audit information',
    'DCK': 'Inventory Control Number',
    'DBN': 'Alias / AKA Family Name',
    'DBG': 'Alias / AKA Given Name',
    'DBS': 'Alias / AKA Suffix Name',
    'DCU': 'Name Suffix',
    'DCE': 'Physical Description Weight Range',
    'DCL': 'Race / Ethnicity',
    'DCM': 'Standard vehicle classification',
    'DCN': 'Standard endorsement code',
    'DCO': 'Standard restriction code',
    'DCP': 'Jurisdiction-specific vehicle classification description',
    'DCQ': 'Jurisdiction-specific endorsement code description',
    'DCR': 'Jurisdiction-specific restriction code description',
    'DDA': 'Compliance Type',
    'DDB': 'Card Revision Date',
    'DDC': 'HazMat Endorsement Expiration Date',
    'DDD': 'Limited Duration Document Indicator',
    'DAW': 'Weight(pounds)',
    'DAX': 'Weight(kilograms)',
    'DDH': 'Under 18 Until',
    'DDI': 'Under 19 Until',
    'DDJ': 'Under 21 Until',
    'DDK': 'Organ Donor Indicator',
    'DDL': 'Veteran Indicator',
    // old standard
    'DAA': 'Customer Full Name',
    'DAB': 'Customer Last Name',
    'DAE': 'Name Suffix',
    'DAF': 'Name Prefix',
    'DAL': 'Residence Street Address1',
    'DAM': 'Residence Street Address2',
    'DAN': 'Residence City',
    'DAO': 'Residence Jurisdiction Code',
    'DAR': 'License Classification Code',
    'DAS': 'License Restriction Code',
    'DAT': 'License Endorsements Code',
    'DAV': 'Height in CM',
    'DBE': 'Issue Timestamp',
    'DBF': 'Number of Duplicates',
    'DBH': 'Organ Donor',
    'DBI': 'Non-Resident Indicator',
    'DBJ': 'Unique Customer Identifier',
    'DBK': 'Social Security Number',
    'DBM': 'Social Security Number',
    'DCH': 'Federal Commercial Vehicle Codes',
    'DBR': 'Name Suffix',
    'PAA': 'Permit Classification Code',
    'PAB': 'Permit Expiration Date',
    'PAC': 'Permit Identifier',
    'PAD': 'Permit IssueDate',
    'PAE': 'Permit Restriction Code',
    'PAF': 'Permit Endorsement Code',
    'ZVA': 'Court Restriction Code',
    'DAD': 'Middle Name'
};

constructor( private http: HttpClient, private auth: AuthenticationService) { }

// https://ccsposdemo.ddns.net:4443/api/dlParser/parsedlData
parseDriverLicense(site: ISite,text: string): Observable<DLScanResults> {

    const  controller =  "/DLParser/"

    const endPoint = "ParseDLData"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const content = {DriverDataString: text};

    return  this.http.post<any>(url, content)

  };

  // https://ccsposdemo.ddns.net:4443/api/dlParser/parsedlData
checkIfIDisValid(site: ISite,text: string): Observable<DLScanResults> {

  const  controller =  "/DLParser/"

  const endPoint = "checkIfIDisValid"

  const parameters = ''

  const url = `${site.url}${controller}${endPoint}${parameters}`

  const content = {DriverDataString: text};

  return  this.http.post<any>(url, content)

};


}
