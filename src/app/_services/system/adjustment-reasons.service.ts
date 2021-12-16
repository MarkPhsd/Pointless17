import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { ISite } from 'src/app/_interfaces';

export interface AdjustmentReason {
  id:   number;
  name: string;
  filter: number;

}

@Injectable({
  providedIn: 'root'
})
export class AdjustmentReasonsService {

  constructor(
    private dialog: MatDialog,
    private http: HttpClient) { }

  getReasons(site: ISite): Observable<AdjustmentReason[]> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'GetReasons'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<AdjustmentReason[]>(url)

  };

  getReasonsByFilter(site: ISite, filter: number): Observable<AdjustmentReason[]> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'getReasonsByFilter'

    const parameters = `?filter=${filter}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<AdjustmentReason[]>(url)

  };

  getReason(site: ISite, id: number): Observable<AdjustmentReason> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'GetReason'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<AdjustmentReason>(url)
  };


  addReason(site: ISite, adjustmentReason: AdjustmentReason): Observable<AdjustmentReason> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'PostReason'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<AdjustmentReason>(url, adjustmentReason)

  };


  editReason(site: ISite, adjustmentReason: AdjustmentReason): Observable<AdjustmentReason> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'PutReason'

    const parameters = `?id=${adjustmentReason.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<AdjustmentReason>(url, adjustmentReason)

  };


  deleteReason(site: ISite, id: number): Observable<AdjustmentReason> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'DeleteReason'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<AdjustmentReason>(url)

  };


  //methods:
  openAdjustmentReasonEdit() {

    const dialogConfig = [
    ]
    const dialogRef = this.dialog.open(AdjustmentReasonsComponent ,
      { width:      '700px',
        minWidth:   '700px',
        height:     '700px',
        minHeight:  '700px',
    },
    )
  }

}
