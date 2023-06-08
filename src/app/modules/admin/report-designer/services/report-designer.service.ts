import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { viewBuilder_View_Field_Values, viewBuilder_ReportJSON, viewBuilder_View_Builder_GroupBy, viewBuilder_Where_Selector, viewBuilderList, ItemBasic, viewBuilder_ViewList, viewBuilder_Report } from '../interfaces/reports';
import { UUID } from 'angular2-uuid';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { AuthenticationService } from 'src/app/_services';
@Injectable({
  providedIn: 'root'
})
export class ReportDesignerService {


  fieldListSelection: viewBuilder_View_Field_Values[] | undefined;
  report = {} as viewBuilder_ReportJSON
  private _report      = new BehaviorSubject<viewBuilder_ReportJSON>(this.report);
  public  report$      = this._report.asObservable();

  fieldsList = [] as viewBuilder_View_Field_Values[] ;
  private _fieldsList      = new BehaviorSubject<viewBuilder_View_Field_Values[]>(this.fieldsList);
  public  fieldsList$      = this._fieldsList.asObservable();



  constructor(
    private httpCache: HttpClientCacheService,
    private httpClient: HttpClient,
    private sitesService: SitesService,
    private auth: AuthenticationService,) {
}



  updateReport(item: viewBuilder_ReportJSON) {
    this.report = item;
    this._report.next(item)
  }

  updateFieldsList(item: viewBuilder_View_Field_Values[]) {
    this.fieldsList = item;
    this._fieldsList.next(item)
  }

  getReportTypeList(): viewBuilder_ViewList[] {
    return viewBuilderList
  }

  loadExampleData() {
    this.fieldListSelection = this.getExampleFieldList()
    this.updateFieldsList(this.fieldListSelection)
    this.report = {} as  viewBuilder_ReportJSON;
    this.report.name = "Example Report";
    this.report.viewBuilder_viewListID = 1;
    this.report.description = "Example fields properties to understand the report";
    this.report.fields = this.getExampleFields();
    this.report.groups = this.getGroupByFields();
    this.report.where = this.getWhereExampleList();

    const list = [] as viewBuilder_Report[];
    const newitem = {} as viewBuilder_Report;
    newitem.id = this.report.id;
    newitem.name = this.report.name;
    newitem.json = JSON.stringify(this.report)
    list.push(newitem)
    return this.report;
  }

  getGroupByFields() {
    const items = [] as viewBuilder_View_Builder_GroupBy[];
    let item = {} as viewBuilder_View_Builder_GroupBy;
    item.id   = UUID.UUID();
    item.name = 'productName';
    items.push(item)
    return items ;
  }

  getExampleFields() {
    const items = [] as viewBuilder_View_Field_Values[]

    let item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = 'SUM';
    item.name = 'itemTotal';
    item.type = 'double';
    item.id   = UUID.UUID();
    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'productName';
    item.type = 'text';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = 'SUM';
    item.name = 'taxTotal1';
    item.type = 'double';
    item.id   = UUID.UUID();

    items.push(item)

    return items;

  }
  getWhereExampleList() {
    const items = []  as viewBuilder_Where_Selector[];

    let item = {} as viewBuilder_Where_Selector;
    item.id = UUID.UUID()
    item.name = 'CompletionDate'
    item.whereType = 'Between'
    item.whereCondition = "'01/01/2023 and 02/01/2023'";
    item.andOr = ''
    item.andOrGroupNumber = 1
    item.andOrGroup = 'AND'
    items.push(item)

    item = {} as viewBuilder_Where_Selector
    item.id = UUID.UUID()
    item.name = 'category'
    item.whereType = '='
    item.whereCondition = "'Blazer'";
    item.andOr = 'OR'
    item.andOrGroupNumber = 2
    item.andOrGroup = ''

    items.push(item)

    item = {} as viewBuilder_Where_Selector
    item.id = UUID.UUID()
    item.name = 'category'
    item.whereType = '='
    item.whereCondition = "'Top Hat'";
    item.andOr = ''
    item.andOrGroupNumber = 2
    item.andOrGroup = ''

    items.push(item)
    return items;

  }
  getExampleFieldList() {
    const items = [] as viewBuilder_View_Field_Values[]

    let item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'itemTotal';
    item.type = 'double';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'productName';
    item.type = 'text';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = 'sum';
    item.name = 'taxTotal1';
    item.type = 'double';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = 'sum';
    item.name = 'taxTotal2';
    item.type = 'double';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = 'sum';
    item.name = 'taxTotal3';
    item.type = 'double';
    item.id   = UUID.UUID();

    items.push(item)


    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'category';
    item.type = 'nvarchar(255)';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'department';
    item.type = 'nvarchar(255)';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'CompletionDate';
    item.type = 'DateTime';
    item.id   = UUID.UUID();

    items.push(item)

    item = {} as viewBuilder_View_Field_Values;
    item.fieldTypeAggregate = '';
    item.name = 'OrderDate';
    item.type = 'DateTime';
    item.id   = UUID.UUID();

    items.push(item)

    return items;
  }


  getSQLStatement(args: any[] ) {
    let sql
    const viewList = viewBuilderList
    if (!this.report || !this.report.viewBuilder_viewListID) {
      // console.log('no view selected', this.report)
      return;
    }

    const view = viewList.filter(data => {
      return data.id == this.report.viewBuilder_viewListID
    })

    const where = this.getWhereString(this.report.where, args)
    const groupBy = this.getGroupBy();
    const orderBy = this.getOrderBy()
    sql = `${this.getSelect()} FROM ${view[0].viewNameValue} ${where} ${groupBy} ${orderBy}`
    return sql
  }

  getWhereString(where: viewBuilder_Where_Selector[], args: any[]) {
    if (!where) { return ''}
    let result : string = '';
    for(let i=0; i< 10; i++){
      const whereStatements = where.filter(conditionFilter => { return conditionFilter.andOrGroupNumber == i})
      let item  =  this.getWhereGroup(i, whereStatements, args)
      if (item) {result = result.concat('', item)}
    }

    if (!result) {return ''}
    return `Where ${result} `;
  }

  getWhereGroup(groupID: number, where: viewBuilder_Where_Selector[], args: any[]) {

    if (!where || where.length == 0){return ''}

    const whereList = where.filter(data => { return data.andOrGroup == groupID.toString() })
    let whereClause = ''
    let i = 0
    let lastGroupValue = ''
    where.forEach(item =>{
      let conditions = {} as unknown[] as ItemBasic[];

      conditions = args.filter(conditionFilter => { return item.id == conditionFilter.index}) as unknown as ItemBasic[];
      let condition = args[0]
      if (condition) {

      } else {

        condition = {} as ItemBasic
        if (item.whereType.toLowerCase() === 'between') {
          condition.value = "'01/01/2023' AND '01/02/2023'"
        } else {
          if (item.whereCondition) {
            condition.value = `${item.whereCondition}`
          } else {
            condition.value = `example value`
          }
        }
      }

      lastGroupValue = ''
      if (item.andOrGroup) {lastGroupValue = item.andOrGroup }
      let andOr = ''
      if (item.andOr && item.andOr != 'null') {
        andOr = item.andOr
      }

      whereClause =  `${whereClause} ${item.name} ${item.whereType} ${condition.value} ${andOr}`
      i += 1
    })

    let whereResult = `( ${whereClause} ) ${lastGroupValue} `

    return whereResult
  }

  getOrderBy() {
    if (this.report && this.report.orderBy) {
      return `ORDER BY ${this.getFieldList(this.report.orderBy)}`
    }
    return ''
  }

  getGroupBy() {
    if (this.report && this.report.groups) {
      return `GROUP BY ${this.getFieldList(this.report.groups)}`
    }
    return ''
  }

  getSelect() {
    if (this.report && this.report.fields) {
      return `SELECT ${this.getFieldList(this.report.fields)}`
    }
    return ''
  }

  getReports() : Observable<viewBuilder_Report[]> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderReport/"

    const endPoint = "GetReports"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 15}

    return  this.httpCache.get<viewBuilder_Report[]>(url);
  }

  getReport(id: string) : Observable<viewBuilder_Report> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderReport/"

    const endPoint = "GetReport"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<viewBuilder_Report>(uri);
  }

  getResults(sql: string): Observable<any> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderReport/"

    const endPoint = "getResults"

    const parameters = `?value=${sql}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get(uri);
  }


  saveReport(report: viewBuilder_ReportJSON): Observable<viewBuilder_Report> {
    const item = {} as viewBuilder_Report;
    item.name = report.name;
    item.id = report.id;
    item.json  = JSON.stringify(report)
    item.viewBuilder_ViewListID = report.viewBuilder_viewListID
    return this.postReport(item)
  }


  postReport(item : viewBuilder_Report) : Observable<viewBuilder_Report> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderReport/"

    const endPoint = "postReport"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 15}

    return  this.httpClient.post<viewBuilder_Report>(uri, item);
  }

  putReport(item : viewBuilder_Report) : Observable<viewBuilder_Report> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderReport/"

    const endPoint = "putReport"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 15}

    return  this.httpClient.put<viewBuilder_Report>(uri, item);
  }

  deleteReport(id: string): Observable<any> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderReport/"

    const endPoint = "deleteReport"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 15}

    return  this.httpClient.delete(uri);
  }

  getViewFieldList( viewName: string) : Observable<any[]> {
    const site = this.sitesService.getAssignedSite()

    const controller = "/ViewBuilderViews/"

    const endPoint = "GetViewFields"

    const parameters = `?viewName=${viewName}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 15}

    return  this.httpClient.get<any[]>(uri);
  }

  getFieldList(list: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    let item : string = ''

    list.forEach(data => {

      const field = data as viewBuilder_View_Field_Values;
      const agg = field?.fieldTypeAggregate

      if (agg) {
        item = `${item} ${agg}(${data.name}) as ${agg}${data.name},`
      } else {
        item = `${item} ${data.name},`
      }

    })

    if (item && item != '') {
      item  = item.slice(0,item.length-1)
    }

    return item;
  }


}

// fields: viewBuilder_View_Field_Values[];
// where:  viewBuilder_Where_Selector[];
// groups: viewBuilder_View_Builder_GroupBy[];
// orderBy: viewBuilder_View_Field_Values[];
