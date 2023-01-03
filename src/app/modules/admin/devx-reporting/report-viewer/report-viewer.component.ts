import { Component, OnInit , ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {

  title = 'DXReportViewerSample';
  reportUrl = 'TestReport';
  hostUrl = 'https://localhost:5001';
  // Use this line if you use an ASP.NET MVC backend
  invokeAction = "/WebDocumentViewer/Invoke";
  // Use this line if you use an ASP.NET Core backend
  // invokeAction = 'DXXRDV';

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
