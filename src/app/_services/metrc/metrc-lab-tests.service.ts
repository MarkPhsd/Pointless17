import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';

import {
  METRCLabTestsStates,
  METRCLabTestTypes,
  METRCLabTestsResults,
  METRCLabTestsRecordPOST,
  METRCLabTEstsLabeTestDocument,
  METRCLabTestResultsRelease
} from '../../_interfaces/metrcs/lab-tests';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { IInventoryAssignment } from '../inventory/inventory-assignment.service';

export interface LabTestResult {
  packageId: number;
  labTestResultId: number;
  labFacilityLicenseNumber: string;
  labFacilityName: string;
  sourcePackageLabel: string;
  productName: string;
  productCategoryName: string;
  testPerformedDate: Date;
  overallPassed: boolean;
  revokedDate?: Date | null;
  labTestResultDocumentFileId: number;
  resultReleased: boolean;
  resultReleaseDateTime: Date;
  expirationDateTime?: Date | null;
  testTypeName: string;
  testPassed: boolean;
  testResultLevel?: number | null;
  testComment: string;
  testInformationalOnly: boolean;
  labTestDetailRevokedDate?: Date | null;
}

export interface LabTestResultResponse {
  data: LabTestResult[];
  total: number;
  totalRecords: number;
  pageSize: number;
  recordsOnPage: number;
  page: number;
  currentPage: number;
  totalPages: number;
}


@Injectable({
  providedIn: 'root'
})
export class MetrcLabTestsService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {}

   getTest(site: ISite, id: number): Observable<METRCPackage> {

    const controller = '/MetrcLabTests/';

    const parameters = `?siteID=${site.id}&metrcID=${id}`;

    const endPoint = 'GetTestForPackage';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.get<METRCPackage>(url);

  }


  getHarvest(site: ISite, id: number): Observable<METRCPackage> {

    const controller = '/MetrcLabTests/';

    const parameters = `?siteID=${site.id}&metrcID=${id}`;

    const endPoint = 'getHarvest';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.get<METRCPackage>(url);

  }

  getTestResults(inv: IInventoryAssignment, metrc: METRCPackage) {

    const labTests = JSON.parse(metrc.labResults) as LabTestResultResponse

  }

}
