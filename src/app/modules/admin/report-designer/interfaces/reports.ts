
export interface ItemBasic {
  id: number;
  name: string;
  description: string;
  value: string;
  type: string;
  image: string;
  thumbnail:string;
}

export const viewBuilder_TypeLookup = [
	"range",
	"number",
	"string"
]

export const aggregateFunctions = [
  {
    id: 1,
    name: "SUM",
    description: "Calculates the sum of a numeric column for each group.",
  },
  {
    id: 2,
    name: "AVG",
    description: "Computes the average of a numeric column for each group.",
  },
  {
    id: 3,
    name: "COUNT",
    description: "Counts the number of rows in each group.",
  },
  {
    id: 4,
    name: "MIN",
    description: "Finds the minimum value of a column for each group.",
  },
  {
    id: 5,
    name: "MAX",
    description: "Retrieves the maximum value of a column for each group.",
  },
  {
    id: 6,
    name: "STDEV",
    description: "Calculates the standard deviation of a numeric column for each group.",
  },
  {
    id: 7,
    name: "STDEVP",
    description: "Computes the standard deviation of a population for a numeric column in each group.",
  },
  {
    id: 8,
    name: "VAR",
    description: "Calculates the variance of a numeric column for each group.",
  },
  {
    id: 9,
    name: "VARP",
    description: "Computes the variance of a population for a numeric column in each group.",
  },
];

export interface viewBuilder_Groups {
	id: number;
	name: string;
	description: string;
}

export interface viewBuilder_ReportTypes {
	id: number;
	name: string;
	chartType: string;
	chartDeveloper: string;
	description: string;
}

//can be overridden;
export const viewBuilderList = [
  {id:1, name: 'Item Sales',  viewNameValue: 'Reports_ItemSales', viewBuilder_ReportTypeID: 1},
  {id:2, name: 'Orders History',  viewNameValue: 'Orders', viewBuilder_ReportTypeID: 2},
  {id:3, name: 'Orders Current',  viewNameValue: 'POSOrders', viewBuilder_ReportTypeID: 2},
  {id:6, name: 'Payments History',  viewNameValue: 'payments', viewBuilder_ReportTypeID: 3},
  {id:7, name: 'Payments Current',  viewNameValue: 'pospayments', viewBuilder_ReportTypeID: 3},
  {id:4, name: 'Menu',  viewNameValue: 'APIMenu', viewBuilder_ReportTypeID: 5},
  {id:5, name: 'METRC',  viewNameValue: 'metrcSalesReport', viewBuilder_ReportTypeID: 8},
  {id:5, name: 'Customers & Entities',  viewNameValue: 'clients', viewBuilder_ReportTypeID: 8},
]   as viewBuilder_ViewList[];

//can be overridden
export const viewBuilder_ReportGroups = [
	{id: 1, name: "Item Sales"},
	{id: 2, name: "Order Sales"},
	{id: 3, name: "Payments Sales"},
	{id: 4, name: "Customers & Entities"},
	{id: 5, name: "Inventory"},
  {id: 6, name: "Menu"},
  {id: 7, name: "Tier Prices"},
  {id: 8, name: "METRC"},
]

/* generated */
export interface viewBuilder_ViewList {
	id: number;
	name: string;
  viewBuilder_ReportTypeID: number;
	viewNameValue: string;
}


export interface viewBuilder_Report {
	id: string;
	viewBuilder_ViewListID: number;
	name: string;
	json: string;
  userTypes: unknown[]
	viewBuilder_reportType: number;
}

export interface viewBuilder_ReportJSON {
	id: string;
	name: string;
	viewBuilder_GroupsID: number;
	viewBuilder_viewListID: number;
	description: string;
	fields: viewBuilder_View_Field_Values[];
	where:  viewBuilder_Where_Selector[];
	groups: viewBuilder_View_Builder_GroupBy[];
	orderBy: viewBuilder_View_Field_Values[];
  dashBoard: string;
  chartType: string;
}

/*
field type options determine if the field
should be calculated or not.
*/
export interface viewBuilder_View_Field_Values {
	id: string;
	type: string;
	name: string;
	fieldTypeAggregate: string; //
  order: number;
}

/*calcluated
can be sum, or no value.
or other allowed values.
*/
export interface viewBuilder_AggregateFunction {
  id: string;
  name: string;
  description: string;
}

/*values for viewBuilder Report */
/*
values for where_Selector
andOrGroupNumber applies
to each group that the and/or values can be part of
 */
export interface viewBuilder_Where_Selector {
	id: string;
	viewBuilder_ReportID: number;
  name: string;
	whereType: string;
  whereCondition: string;
  andOr: string;
	andOrGroupNumber: number;
  andOrGroup: string;
}

export interface whereType {
  name: string;
}

export const whereTypeList = [
  {name: '='},
  {name: 'Between'},
  {name: '>'},
  {name: '<'},
  {name: '=>'},
  {name: '<='},
  {name: '<>'},
  {name: 'like'},
]

export interface viewBuilder_View_Builder_GroupBy {
	id: string;
	name: string;
}

export const chartTypeCollection  = [
  { name: "Data List" , icon: '' },
  { name: "arcdiagram" , icon: '' },
  { name: "area" , icon: '' },
  { name: "arearange" , icon: '' },
  { name: "areaspline" , icon: '' },
  { name: "areasplinerange" , icon: '' },
  { name: "bar" , icon: 'bar_chart' },
  { name: "bellcurve" , icon: '' },
  { name: "boxplot" , icon: '' },
  { name: "bubble" , icon: 'bubble_chart' },
  { name: "bullet" , icon: '' },
  { name: "column" , icon: '' },
  { name: "columnpyramid" , icon: '' },
  { name: "columnrange" , icon: '' },
  { name: "cylinder" , icon: '' },
  { name: "dependencywheel" , icon: '' },
  { name: "dumbbell" , icon: '' },
  { name: "errorbar" , icon: '' },
  { name: "funnel" , icon: '' },
  { name: "funnel3d" , icon: '' },
  { name: "gauge" , icon: '' },
  { name: "heatmap" , icon: '' },
  { name: "histogram" , icon: '' },
  { name: "item" , icon: '' },
  { name: "line" , icon: 'show_chart' },
  { name: "lollipop" , icon: '' },
  { name: "networkgraph" , icon: '' },
  { name: "organization" , icon: '' },
  { name: "packedbubble" , icon: '' },
  { name: "pareto" , icon: '' },
  { name: "pie" , icon: 'pie_chart' },
  { name: "polygon" , icon: '' },
  { name: "pyramid" , icon: '' },
  { name: "pyramid3d" , icon: '' },
  { name: "sankey" , icon: '' },
  { name: "scatter" , icon: 'scatter_chart' },
  { name: "scatter3d" , icon: '' },
  { name: "solidgauge" , icon: '' },
  { name: "spline" , icon: '' },
  { name: "streamgraph" , icon: '' },
  { name: "sunburst" , icon: '' },
  { name: "tilemap" , icon: '' },
  { name: "timeline" , icon: '' },
  { name: "treemap" , icon: '' },
  { name: "variablepie" , icon: '' },
  { name: "variwide" , icon: '' },
  { name: "vector" , icon: '' },
  { name: "venn" , icon: '' },
  { name: "waterfall" , icon: '' },
  { name: "windbarb" , icon: '' },
  { name: "wordcloud" , icon: '' },
  { name: "xrange" , icon: '' },
]
