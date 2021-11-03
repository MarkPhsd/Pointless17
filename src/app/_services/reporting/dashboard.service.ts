import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  Parameter = ""
  users: any[];
  sales: any[];
  salesResults: any[];
  salesValues: any[];
  seriesNames: any[];
  chartValues: any[];
  label: string;

  constructor(private http: HttpClient) { }



}
