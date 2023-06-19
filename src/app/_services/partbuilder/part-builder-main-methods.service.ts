import { Injectable } from '@angular/core';
import { PB_Main, PartBuilderMainService } from './part-builder-main.service';
import { BehaviorSubject } from 'rxjs';
import { SitesService } from '../reporting/sites.service';

@Injectable({
  providedIn: 'root'
})
export class PartBuilderMainMethodsService {

  private _PB_Main   = new BehaviorSubject<PB_Main>(null);
  public  PB_Main$ = this._PB_Main.asObservable();

  constructor(private partBuilderMainService: PartBuilderMainService,
              private sitesService: SitesService) { }

  updatePBMain(pb_Main: PB_Main) {
    this._PB_Main.next(pb_Main)
  }


}
