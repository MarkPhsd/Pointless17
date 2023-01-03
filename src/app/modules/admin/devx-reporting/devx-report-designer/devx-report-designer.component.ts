import { Component, OnInit , ViewEncapsulation} from '@angular/core';
// import { Component, ViewEncapsulation } from '@angular/core';
// "../../node_modules/devextreme/dist/css/dx.light.css",
@Component({
  selector: 'app-devx-report-designer',
  templateUrl: './devx-report-designer.component.html',
  styleUrls: ['./devx-report-designer.component.scss']

})
export class DevxReportDesignerComponent implements OnInit {

  // title = 'DXReportViewerSample';
  // reportUrl = 'Products';
  // hostUrl = 'https://localhost:5001';
  // // Use this line if you use an ASP.NET MVC backend
  // //invokeAction: string = "/WebDocumentViewer/Invoke";
  // // Use this line if you use an ASP.NET Core backend
  // invokeAction = 'DXXRDV';

  title = 'DXReportDesignerSample';

  // If you use the ASP.NET Core backend:
  getDesignerModelAction = "/DXXRD/GetDesignerModel"

  // If you use the ASP.NET MVC backend:
  //getDesignerModelAction = "/ReportDesigner/GetReportDesignerModel";

  // The report name.
  reportName = "TestReport";
  // The backend application URL.
  host = 'https://localhost:5001/';

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
// "../../node_modules/devextreme/dist/css/dx.light.css",
// "../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
// "../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.light.css",
// "../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css"
// ]
