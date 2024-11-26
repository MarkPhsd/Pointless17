import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { CustomReuseStrategy } from 'src/app/_routing/route-reuse-strategy';

import { AuthGuard } from './_http-interceptors/auth.guard';
import { AgeVerificationGuardService } from './_http-interceptors/age-verification-guard.service';

const routes: Routes = [
  {
    path: 'qr-order-table',
    loadComponent: () =>
      import('./modules/orders/qrcode-table/qrcode-table.component').then(
        (m) => m.QRCodeTableComponent
      ),
    data: { title: 'Order Table', animation: 'isLeft' },
  },
  {
    path: 'qr-receipt',
    loadComponent: () =>
      import('./modules/orders/qrcode-table/qrcode-table.component').then(
        (m) => m.QRCodeTableComponent
      ),
    data: { title: 'Order', animation: 'isLeft' },
  },
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/default.component').then((m) => m.DefaultComponent),
    children: [
      {
        path: 'signature',
        loadComponent: () =>
          import('./shared/widgets/signature-pad/signature-pad.component').then(
            (m) => m.SignatureComponent
          ),
        data: { title: 'signature', animation: 'isLeft' },
      },
      {
        path: 'schedule-validator',
        loadComponent: () =>
          import('./shared/widgets/schedule-selector/schedule-selector.component').then(
            (m) => m.ScheduleSelectorComponent
          ),
        data: { title: 'schedule validator', animation: 'isLeft' },
      },
      {
        path: 'date-validator',
        loadComponent: () =>
          import(
            './shared/widgets/schedule-date-range-selector/schedule-date-range-selector.component'
          ).then((m) => m.ScheduleDateRangeSelectorComponent),
        data: { title: 'validator', animation: 'isLeft' },
      },
      {
        path: 'qr-payment',
        loadComponent: () =>
          import('./modules/orders/qr-payment/qr-payment.component').then(
            (m) => m.QrPaymentComponent
          ),
        data: { title: 'Order', animation: 'isLeft' },
      },
      {
        path: 'payment-completed',
        loadComponent: () =>
          import(
            './modules/payment-processing/online-payment-completed/online-payment-completed.component'
          ).then((m) => m.OnlinePaymentCompletedComponent),
        data: { title: 'Success', animation: 'isLeft' },
      },
      {
        path: 'pay-api',
        loadComponent: () =>
          import('./modules/payment-processing/pay-api/pay-api.component').then(
            (m) => m.PayAPIComponent
          ),
        data: { title: 'Order', animation: 'isLeft' },
      },
      {
        path: 'pay-api-iframe',
        loadComponent: () =>
          import(
            './modules/payment-processing/pay-apiiframe/pay-apiiframe.component'
          ).then((m) => m.PayAPIFrameComponent),
        data: { title: 'Order', animation: 'isLeft' },
      },
      // eBay Components
      {
        path: 'ebay-publish-product',
        loadComponent: () =>
          import(
            './modules/admin/inventory/ebay/ebay-publish-product/ebay-publish-product.component'
          ).then((m) => m.EbayPublishProductComponent),
        canActivate: [AuthGuard],
        data: { title: 'Ebay Publisher', animation: 'isLeft' },
      },
      {
        path: 'ebay-fufillment-policy',
        loadComponent: () =>
          import(
            './modules/admin/inventory/ebay/ebay-fulfillment-policy/ebay-fulfillment-policy.component'
          ).then((m) => m.EbayFulfillmentPolicyComponent),
        canActivate: [AuthGuard],
        data: { title: 'Ebay Fulfillment Policy', animation: 'isLeft' },
      },
      {
        path: 'ebay-return-policy',
        loadComponent: () =>
          import(
            './modules/admin/inventory/ebay/ebay-return-policy/ebay-return-policy.component'
          ).then((m) => m.EbayReturnPolicyComponent),
        canActivate: [AuthGuard],
        data: { title: 'Ebay Return Policy', animation: 'isLeft' },
      },
      {
        path: 'ebay-auth-redirect',
        loadComponent: () =>
          import(
            './modules/admin/settings/software/ebay-settings/ebay-auth-redirect/ebay-auth-redirect.component'
          ).then((m) => m.EbayAuthRedirectComponent),
        canActivate: [AuthGuard],
        data: { title: 'Ebay Auth Redirect', animation: 'isLeft' },
      },
      {
        path: 'posEditSettings',
        loadComponent: () =>
          import(
            './modules/admin/settings/pos-list/pos-edit-settings/pos-edit-settings.component'
          ).then((m) => m.PosEditSettingsComponent),
        canActivate: [AuthGuard],
        data: { title: 'POS Edit Settings', animation: 'isLeft' },
      },
      // Buy/Sell Components
      {
        path: 'buy-sell',
        loadComponent: () =>
          import('./modules/buySell/buy-sell-main/buy-sell-main.component').then(
            (m) => m.BuySellMainComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Resale Brand Classes', animation: 'isLeft' },
      },
      {
        path: 'resale-brand-classes',
        loadComponent: () =>
          import(
            './modules/admin/resale_manager/brands/main/main.component'
          ).then((m) => m.BrandEditorMainComponent),
        canActivate: [AuthGuard],
        data: { title: 'Resale Brand Classes', animation: 'isLeft' },
      },
      {
        path: 'resale-price-classes',
        loadComponent: () =>
          import(
            './modules/admin/resale_manager/classes/resale-classes-main/resale-classes-main.component'
          ).then((m) => m.ResaleClassesMainComponent),
        canActivate: [AuthGuard],
        data: { title: 'Resale Classes', animation: 'isLeft' },
      },
      {
        path: 'message-list',
        loadComponent: () =>
          import(
            './modules/admin/message-editor-list/message-editor-list.component'
          ).then((m) => m.MessageEditorListComponent),
        data: { title: 'Message List', animation: 'isLeft' },
      },
      // Part Builder Components
      {
        path: 'part-builder-list',
        loadComponent: () =>
          import(
            './modules/admin/products/part-builder/part-builder-main/part-builder-main.component'
          ).then((m) => m.PartBuilderMainComponent),
        data: { title: 'Part Builder', animation: 'isLeft' },
      },
      {
        path: 'part-builder-edit',
        loadComponent: () =>
          import(
            './modules/admin/products/part-builder/part-builder-edit/part-builder-edit.component'
          ).then((m) => m.PartBuilderEditComponent),
        data: { title: 'Part Builder Edit', animation: 'isLeft' },
      },
      {
        path: 'part-usage-list',
        loadComponent: () =>
          import(
            './modules/admin/products/part-builder/part-builder-usage-list/part-builder-usage-list.component'
          ).then((m) => m.PartBuilderUsageListComponent),
        data: { title: 'Part Usage List', animation: 'isLeft' },
      },
      // Main Menu
      {
        path: '',
        loadComponent: () =>
          import(
            './modules/menu/mainMenu/main-menu/main-menu.component'
          ).then((m) => m.MainMenuComponent),
        canActivate: [AgeVerificationGuardService],
        data: { animation: 'isLeft' },
      },
      {
        path: 'filter',
        loadComponent: () =>
          import('./shared/widgets/product-filter/product-filter.component').then(
            (m) => m.ProductFilterComponent
          ),
        data: { title: 'Filter', animation: 'isLeft' },
      },
      // Designer Components
      {
        path: 'ps-designer-list',
        loadComponent: () =>
          import(
            './modules/admin/report-designer/designer/designer-list/designer-list.component'
          ).then((m) => m.DesignerListComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      {
        path: 'ps-report-editor',
        loadComponent: () =>
          import(
            './modules/admin/report-designer/designer/designer-editor/designer-editor.component'
          ).then((m) => m.DesignerEditorComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Reporting Components
      {
        path: 'report-designer',
        loadComponent: () =>
          import(
            './modules/admin/devx-reporting/devx-report-designer/devx-report-designer.component'
          ).then((m) => m.DevxReportDesignerComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      {
        path: 'report-viewer',
        loadComponent: () =>
          import(
            './modules/admin/devx-reporting/report-viewer/report-viewer.component'
          ).then((m) => m.ReportViewerComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      {
        path: 'swipedelete',
        loadComponent: () =>
          import(
            './shared/widgets/ionic-swipe-to-delete/ionic-swipe-to-delete.component'
          ).then((m) => m.IonicSwipeToDeleteComponent),
        data: { animation: 'isLeft' },
      },
      {
        path: 'app-main-menu',
        loadComponent: () =>
          import(
            './modules/menu/mainMenu/main-menu/main-menu.component'
          ).then((m) => m.MainMenuComponent),
        canActivate: [AgeVerificationGuardService],
        data: { title: 'Main Menu', animation: 'isLeft' },
      },
      {
        path: 'app-profile',
        loadComponent: () =>
          import('./modules/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Department and Category Components
      {
        path: 'department-list',
        loadComponent: () =>
          import('./modules/menu/department-menu/department-menu.component').then(
            (m) => m.DepartmentMenuComponent
          ),
        data: { title: 'Department Menu', animation: 'isLeft' },
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./modules/menu/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
        canActivate: [AgeVerificationGuardService],
        data: { title: 'Categories', animation: 'isLeft' },
      },
      {
        path: 'brandslist',
        loadComponent: () =>
          import('./modules/menu/brandslist/brandslist.component').then(
            (m) => m.BrandslistComponent
          ),
        canActivate: [AgeVerificationGuardService],
        data: { title: 'Brands', animation: 'isLeft' },
      },
      {
        path: 'menuitems-infinite',
        loadComponent: () =>
          import(
            './modules/menu/menuitems/menu-items-infinite/menu-items-infinite.component'
          ).then((m) => m.MenuItemsInfiniteComponent),
        canActivate: [AgeVerificationGuardService],
        data: { title: 'Menu Items', animation: 'isLeft' },
      },
      {
        path: 'menuitem',
        loadComponent: () =>
          import('./modules/menu/menuitem/menuitem.component').then(
            (m) => m.MenuitemComponent
          ),
        canActivate: [AgeVerificationGuardService],
        data: { title: 'Item', animation: 'isLeft' },
      },
      {
        path: 'searchproducts',
        loadComponent: () =>
          import('./modules/menu/search-results/search-results.component').then(
            (m) => m.SearchResultsComponent
          ),
        canActivate: [AgeVerificationGuardService],
        data: { animation: 'isLeft' },
      },
      // Dashboard and Reports
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/admin/reports/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Dash Board', animation: 'isLeft' },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./modules/admin/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Reports', animation: 'isLeft' },
      },
      // Floor Plan
      {
        path: 'table-layout',
        loadComponent: () =>
          import('./modules/floor-plan/floor-plan/floor-plan.component').then(
            (m) => m.FloorPlanComponent
          ),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Settings
      {
        path: 'app-settings',
        loadComponent: () =>
          import('./modules/admin/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Settings', animation: 'isLeft' },
      },
      {
        path: 'sites',
        loadComponent: () =>
          import('./modules/sites/sites.component').then(
            (m) => m.SitesComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Sites', animation: 'isLeft' },
      },
      {
        path: 'site-edit',
        loadComponent: () =>
          import('./modules/admin/settings/site-edit/site-edit.component').then(
            (m) => m.SiteEditComponent
          ),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      {
        path: 'store-list',
        loadComponent: () =>
          import(
            './modules/admin/stores-manager/stores-manager.component'
          ).then((m) => m.StoresManagerComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // POS Payments
      {
        path: 'pos-payments',
        loadComponent: () =>
          import(
            './modules/transactions/pos-payments-main/pospayments/pospayments.component'
          ).then((m) => m.POSPaymentsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Payments Listing', animation: 'isLeft' },
      },
      {
        path: 'pos-payment-edit',
        loadComponent: () =>
          import(
            './modules/posorders/pos-payment/pos-payment-edit/pos-payment-edit.component'
          ).then((m) => m.PosPaymentEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Edit Payment', animation: 'isLeft' },
      },
      // Function Group
      {
        path: 'function-group-list',
        loadComponent: () =>
          import(
            './modules/admin/settings/function-groups/function-group-list/function-group-list.component'
          ).then((m) => m.FunctionGroupListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Function List', animation: 'isLeft' },
      },
      {
        path: 'function-group-edit',
        loadComponent: () =>
          import(
            './modules/admin/settings/function-groups/function-group-edit/function-group-edit.component'
          ).then((m) => m.FunctionGroupEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Function Edit', animation: 'isLeft' },
      },
      // Store Credit and Orders
      {
        path: 'store-credit',
        loadComponent: () =>
          import(
            './modules/admin/store-credit/store-credit-list/store-credit-list.component'
          ).then((m) => m.StoreCreditListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Store Credit Search', animation: 'isLeft' },
      },
      {
        path: 'pos-orders',
        loadComponent: () =>
          import('./modules/orders/orders-main/orders-main.component').then(
            (m) => m.OrdersMainComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Orders', animation: 'isLeft' },
      },
      {
        path: 'currentorder',
        loadComponent: () =>
          import('./modules/posorders/pos-order/pos-order.component').then(
            (m) => m.PosOrderComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Current Order', animation: 'isLeft' },
      },
      {
        path: 'pos-payment',
        loadComponent: () =>
          import('./modules/posorders/pos-payment/pos-payment.component').then(
            (m) => m.PosPaymentComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Payment', animation: 'isLeft' },
      },
      {
        path: 'pos-items',
        loadComponent: () =>
          import(
            './modules/posorders/pos-order/pos-order-items/pos-order-items.component'
          ).then((m) => m.PosOrderItemsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Order Items', animation: 'isLeft' },
      },
      // Content
      {
        path: 'content',
        loadComponent: () =>
          import(
            './modules/admin/blogEditor/blog-list-edit/blog-list-edit.component'
          ).then((m) => m.BlogListEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Content List', animation: 'isLeft' },
      },
      // Employee Clock
      {
        path: 'employee-clock',
        loadComponent: () =>
          import(
            './modules/admin/employeeClockAdmin/employee-clock-list/employee-clock-list.component'
          ).then((m) => m.EmployeeClockListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Employee Time Clock', animation: 'isLeft' },
      },
      {
        path: 'break-types',
        loadComponent: () =>
          import(
            './modules/admin/employeeClockAdmin/clock-breaks-types/clock-breaks-types.component'
          ).then((m) => m.ClockBreaksTypesComponent),
        canActivate: [AuthGuard],
        data: { title: 'Employee Time Clock', animation: 'isLeft' },
      },
      // Operations and Item Sales
      {
        path: 'operations',
        loadComponent: () =>
          import(
            './modules/transactions/operations/pos-operations/pos-operations.component'
          ).then((m) => m.PosOperationsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Operations', animation: 'isLeft' },
      },
      {
        path: 'item-sales',
        loadComponent: () =>
          import(
            './modules/transactions/itemTransactions/items-main/items-main.component'
          ).then((m) => m.ItemsMainComponent),
        canActivate: [AuthGuard],
        data: { title: 'Item Sales', animation: 'isLeft' },
      },
      // Balance Sheets
      {
        path: 'balance-sheets',
        loadComponent: () =>
          import(
            './modules/transactions/balanceSheets/balance-sheets/balance-sheets.component'
          ).then((m) => m.BalanceSheetsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Balance Sheet', animation: 'isLeft' },
      },
      {
        path: 'balance-sheet-edit',
        loadComponent: () =>
          import(
            './modules/transactions/balanceSheets/balance-sheet-edit/balance-sheet-edit.component'
          ).then((m) => m.BalanceSheetEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Balance Sheet Edit', animation: 'isLeft' },
      },
      // Prompt Groups
      {
        path: 'prompt-groups',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-groups/prompt-groups.component'
          ).then((m) => m.PromptGroupsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Groups', animation: 'isLeft' },
      },
      {
        path: 'prompt-group-edit',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-groups/prompt-group-edit/prompt-group-edit.component'
          ).then((m) => m.PromptGroupEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Group Edit', animation: 'isLeft' },
      },
      // Prompt Sub Groups
      {
        path: 'prompt-sub-groups',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-groups.component'
          ).then((m) => m.PromptSubGroupsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Sub Groups', animation: 'isLeft' },
      },
      {
        path: 'prompt-item-selection',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-item-selection/prompt-item-selection.component'
          ).then((m) => m.PromptItemSelectionComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Item Selection', animation: 'isLeft' },
      },
      {
        path: 'prompt-items-selected',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-item-selection/prompt-selected-items/prompt-selected-items.component'
          ).then((m) => m.PromptSelectedItemsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Items Selected', animation: 'isLeft' },
      },
      // Prompt Kits
      {
        path: 'prompt-kits',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-kits/prompt-kits.component'
          ).then((m) => m.PromptKitsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Kits', animation: 'isLeft' },
      },
      {
        path: 'prompt-associations',
        loadComponent: () =>
          import(
            './modules/admin/menuPrompt/prompt-sub-group-association/prompt-sub-group-association.component'
          ).then((m) => m.PromptSubGroupAssociationComponent),
        canActivate: [AuthGuard],
        data: { title: 'Prompt Association', animation: 'isLeft' },
      },
      // Wishlist
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./modules/profile/wishlist/wishlist.component').then(
            (m) => m.WishlistComponent
          ),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Product Components
      {
        path: 'productedit',
        loadComponent: () =>
          import(
            './modules/admin/products/productedit/productedit.component'
          ).then((m) => m.ProducteditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Product Edit', animation: 'isLeft' },
      },
      {
        path: 'product-list-view',
        loadComponent: () =>
          import(
            './modules/admin/products/productlistview/productlistview.component'
          ).then((m) => m.ProductlistviewComponent),
        canActivate: [AuthGuard],
        data: { title: 'Item List', animation: 'isLeft' },
      },
      {
        path: 'price-categories',
        loadComponent: () =>
          import(
            './modules/admin/products/pricing/price-categories/price-categories.component'
          ).then((m) => m.PriceCategoriesComponent),
        canActivate: [AuthGuard],
        data: { title: 'Product Categories', animation: 'isLeft' },
      },
      // Price Schedule
      {
        path: 'price-schedule',
        loadComponent: () =>
          import(
            './modules/admin/products/price-schedule/price-schedule-list/price-schedule-list.component'
          ).then((m) => m.PriceScheduleListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Catalog Schedule', animation: 'isLeft' },
      },
      {
        path: 'price-schedule-edit',
        loadComponent: () =>
          import(
            './modules/admin/products/price-schedule/price-schedule.component'
          ).then((m) => m.PriceScheduleComponent),
        canActivate: [AuthGuard],
        data: { title: 'Catalog Schedule Edit', animation: 'isLeft' },
      },
      {
        path: 'price-schedule-menu-items',
        loadComponent: () =>
          import(
            './modules/priceSchedule/price-schedule-menu-items/price-schedule-menu-items.component'
          ).then((m) => m.PriceScheduleMenuItemsComponent),
        data: { title: 'Menu Items', animation: 'isLeft' },
      },
      // Display Menu
      {
        path: 'display-menu-main',
        loadComponent: () =>
          import(
            './modules/display-menu/display-menu/display-menu-main/display-menu-main.component'
          ).then((m) => m.DisplayMenuMainComponent),
        data: { title: 'Display Menu', animation: 'isLeft' },
      },
      {
        path: 'display-menu',
        loadComponent: () =>
          import(
            './modules/display-menu/display-menu-list/display-menu-list.component'
          ).then((m) => m.DisplayMenuListComponent),
        data: { title: 'Display Menu', animation: 'isLeft' },
      },
      {
        path: 'app-menu-section',
        loadComponent: () =>
          import(
            './modules/display-menu/display-menu-list/menu-section/menu-section.component'
          ).then((m) => m.MenuSectionComponent),
        data: { title: 'Display Menu', animation: 'isLeft' },
      },
      {
        path: 'display-section',
        loadComponent: () =>
          import(
            './modules/display-menu/display-menu-menu/display-menu-menu.component'
          ).then((m) => m.DisplayMenuMenuComponent),
        data: { title: 'Display Menu', animation: 'isLeft' },
      },
      {
        path: 'admin-display-menu',
        loadComponent: () =>
          import(
            './modules/admin/products/display-menu/display-menu-list/display-menu-list.component'
          ).then((m) => m.AdminDisplayMenuListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Display Menu', animation: 'isLeft' },
      },
      // PS Menu Group List
      {
        path: 'psmenu-group-list',
        loadComponent: () =>
          import(
            './modules/admin/products/price-schedule-menu-groups/psmenu-group-list/psmenu-group-list.component'
          ).then((m) => m.PSMenuGroupListComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Category List View
      {
        path: 'categorylist',
        loadComponent: () =>
          import(
            './modules/admin/products/categorieslistview/categoriestlistview.component'
          ).then((m) => m.CategorieslistviewComponent),
        canActivate: [AuthGuard],
        data: { title: 'Category List', animation: 'isLeft' },
      },
      {
        path: 'categorieslistview',
        loadComponent: () =>
          import(
            './modules/admin/products/categorieslistview/categoriestlistview.component'
          ).then((m) => m.CategorieslistviewComponent),
        canActivate: [AuthGuard],
        data: { title: 'Category List', animation: 'isLeft' },
      },
      // Admin Brands
      {
        path: 'adminbrandslist',
        loadComponent: () =>
          import(
            './modules/admin/products/adminbrandslist/adminbrandslist.component'
          ).then((m) => m.AdminbrandslistComponent),
        canActivate: [AuthGuard],
        data: { title: 'Brand List', animation: 'isLeft' },
      },
      {
        path: 'adminbranditem',
        loadComponent: () =>
          import(
            './modules/admin/products/adminbrandslist/adminbranditem/adminbranditem.component'
          ).then((m) => m.AdminbranditemComponent),
        canActivate: [AuthGuard],
        data: { title: 'Brand Edit', animation: 'isLeft' },
      },
      // POS List
      {
        path: 'pos-list',
        loadComponent: () =>
          import('./modules/admin/settings/pos-list/pos-list.component').then(
            (m) => m.PosListComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'POS List', animation: 'isLeft' },
      },
      // Flat Rate and Taxes
      {
        path: 'flatrate',
        loadComponent: () =>
          import(
            './modules/admin/products/flatRate/flat-rate-list/flat-rate-list.component'
          ).then((m) => m.FlatRateListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Flat Rate List', animation: 'isLeft' },
      },
      {
        path: 'item-types',
        loadComponent: () =>
          import(
            './modules/admin/products/item-type/item-type.component'
          ).then((m) => m.ItemTypeComponent),
        canActivate: [AuthGuard],
        data: { title: 'Item Type', animation: 'isLeft' },
      },
      {
        path: 'taxes',
        loadComponent: () =>
          import(
            './modules/admin/products/taxes/tax-list/tax-list.component'
          ).then((m) => m.TaxListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Tax List', animation: 'isLeft' },
      },
      {
        path: 'flat-rate-taxes',
        loadComponent: () =>
          import(
            './modules/admin/products/flatRate/flat-rate-list/flat-rate-list.component'
          ).then((m) => m.FlatRateListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Flat Rate List', animation: 'isLeft' },
      },
      {
        path: 'unit-types',
        loadComponent: () =>
          import(
            './modules/admin/products/unit-type-list/unit-type-list.component'
          ).then((m) => m.UnitTypeListComponent),
        data: { title: 'Unit Type List', animation: 'isLeft' },
      },
      {
        path: 'printer-locations',
        loadComponent: () =>
          import(
            './modules/admin/products/printer-locations/printer-locations.component'
          ).then((m) => m.PrinterLocationsComponent),
        data: { title: 'Printer Locations', animation: 'isLeft' },
      },
      // Price Tiers
      {
        path: 'price-tier-list-edit',
        loadComponent: () =>
          import(
            './modules/admin/products/price-tiers/price-tiers.component'
          ).then((m) => m.PriceTiersComponent),
        data: { title: 'Price Tier List', animation: 'isLeft' },
      },
      // Order Items
      {
        path: 'app-order-items-list',
        loadComponent: () =>
          import(
            './modules/posorders/order-items-list/order-items-list.component'
          ).then((m) => m.OrderItemsListComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      {
        path: 'app-order-item-list',
        loadComponent: () =>
          import(
            './modules/posorders/order-items-list/order-item-list/order-item-list.component'
          ).then((m) => m.OrderItemListComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // METRC Sales
      {
        path: 'metrc-sales-report',
        loadComponent: () =>
          import(
            './modules/admin/metrc/pointless-metrcsales/pointless-metrcsales.component'
          ).then((m) => m.PointlessMETRCSalesComponent),
        canActivate: [AuthGuard],
        data: { title: 'METRC Sales Report', animation: 'isLeft' },
      },
      {
        path: 'metrc-posted-sales',
        loadComponent: () =>
          import(
            './modules/admin/metrc/metrc-sales-list/metrc-sales-list.component'
          ).then((m) => m.MetrcSalesListComponent),
        canActivate: [AuthGuard],
        data: { title: 'METRC Posted Sales', animation: 'isLeft' },
      },
      // Package List and METRC Categories
      {
        path: 'package-list',
        loadComponent: () =>
          import(
            './modules/admin/metrc/packages/package-list.component'
          ).then((m) => m.PackageListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Package List', animation: 'isLeft' },
      },
      {
        path: 'metrc-categories-list',
        loadComponent: () =>
          import(
            './modules/admin/metrc/items/item-categories-list/item-categories-list.component'
          ).then((m) => m.ItemCategoriesListComponent),
        canActivate: [AuthGuard],
        data: { title: 'METRC Categories List', animation: 'isLeft' },
      },
      {
        path: 'metrc-facilities-list',
        loadComponent: () =>
          import(
            './modules/admin/metrc/facilities/facilities-list/facilities-list.component'
          ).then((m) => m.FacilitiesListComponent),
        canActivate: [AuthGuard],
        data: { title: 'METRC Facilities List', animation: 'isLeft' },
      },
      // Inventory Components
      {
        path: 'manifests',
        loadComponent: () =>
          import(
            './modules/admin/inventory/manifests/manifests.component'
          ).then((m) => m.ManifestsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Manifests', animation: 'isLeft' },
      },
      {
        path: 'inventory-list',
        loadComponent: () =>
          import(
            './modules/admin/inventory/inventory-list/inventory-list/inventory-list.component'
          ).then((m) => m.InventoryListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Inventory', animation: 'isLeft' },
      },
      {
        path: 'inventory-locations',
        loadComponent: () =>
          import(
            './modules/admin/inventory/inventory-locations/inventory-locations.component'
          ).then((m) => m.InventoryLocationsComponent),
        canActivate: [AuthGuard],
        data: { title: 'Inventory Locations', animation: 'isLeft' },
      },
      {
        path: 'manifest-status',
        loadComponent: () =>
          import(
            './modules/admin/inventory/manifest-status/manifest-status.component'
          ).then((m) => m.ManifestStatusComponent),
        canActivate: [AuthGuard],
        data: { title: 'Manifest Status List', animation: 'isLeft' },
      },
      {
        path: 'manifest-types',
        loadComponent: () =>
          import(
            './modules/admin/inventory/manifest-type/manifest-type.component'
          ).then((m) => m.ManifestTypeComponent),
        canActivate: [AuthGuard],
        data: { title: 'Manifest Type List', animation: 'isLeft' },
      },
      // Profile Editing
      {
        path: 'profileEditor',
        loadComponent: () =>
          import(
            './modules/admin/profiles/profile-editor/profile-editor.component'
          ).then((m) => m.ProfileEditorComponent),
        canActivate: [AuthGuard],
        data: { title: 'Profile', animation: 'isLeft' },
      },
      {
        path: 'profileListing',
        loadComponent: () =>
          import(
            './modules/admin/profiles/profile-lookup/profile-lookup.component'
          ).then((m) => m.ProfileLookupComponent),
        canActivate: [AuthGuard],
        data: { title: 'Profiles', animation: 'isLeft' },
      },
      // Employee Management
      {
        path: 'employee-list',
        loadComponent: () =>
          import(
            './modules/admin/employees/employee-list/employee-list.component'
          ).then((m) => m.EmployeeListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Employees', animation: 'isLeft' },
      },
      {
        path: 'employee-edit',
        loadComponent: () =>
          import(
            './modules/admin/employees/employee-edit/employee-edit.component'
          ).then((m) => m.EmployeeEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Employee', animation: 'isLeft' },
      },
      // Client Settings
      {
        path: 'client-type-list',
        loadComponent: () =>
          import(
            './modules/admin/clients/client-types/client-type-list/client-type-list.component'
          ).then((m) => m.ClientTypeListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Client Types', animation: 'isLeft' },
      },
      {
        path: 'client-type-edit',
        loadComponent: () =>
          import(
            './modules/admin/clients/client-types/client-type-edit/client-type-edit.component'
          ).then((m) => m.ClientTypeEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Client Type Edit', animation: 'isLeft' },
      },
      {
        path: 'job-type-list',
        loadComponent: () =>
          import(
            './modules/admin/clients/jobs/job-types-list/job-types-list.component'
          ).then((m) => m.JobTypesListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Job Types', animation: 'isLeft' },
      },
      // Transaction Settings
      {
        path: 'service-type-list',
        loadComponent: () =>
          import(
            './modules/admin/transactions/serviceTypes/service-type-list/service-type-list.component'
          ).then((m) => m.ServiceTypeListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Service Type List', animation: 'isLeft' },
      },
      {
        path: 'service-type-edit',
        loadComponent: () =>
          import(
            './modules/admin/transactions/serviceTypes/service-type-edit/service-type-edit.component'
          ).then((m) => m.ServiceTypeEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Service Type Edit', animation: 'isLeft' },
      },
      // Payment Methods
      {
        path: 'edit-payment-method',
        loadComponent: () =>
          import(
            './modules/admin/transactions/paymentMethods/payment-method-edit/payment-method-edit.component'
          ).then((m) => m.PaymentMethodEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Edit Payment Methods', animation: 'isLeft' },
      },
      {
        path: 'edit-payment-method-list',
        loadComponent: () =>
          import(
            './modules/admin/transactions/paymentMethods/payment-method-list/payment-method-list.component'
          ).then((m) => m.PaymentMethodListComponent),
        canActivate: [AuthGuard],
        data: { title: 'Edit Payment Methods List', animation: 'isLeft' },
      },
      // Misc Components
      {
        path: 'imagecapture',
        loadComponent: () =>
          import('./shared/widgets/image-capture/image-capture.component').then(
            (m) => m.ImageCaptureComponent
          ),
        data: { title: 'Image Capture', animation: 'isLeft' },
      },
      {
        path: 'review-edit',
        loadComponent: () =>
          import(
            './modules/reviews/review-edit/review-edit.component'
          ).then((m) => m.ReviewEditComponent),
        canActivate: [AuthGuard],
        data: { title: 'Review Edit', animation: 'isLeft' },
      },
      {
        path: 'cat-alternate',
        loadComponent: () =>
          import(
            './modules/menu/categories/categories-alternate/categories-alternate.component'
          ).then((m) => m.CategoriesAlternateComponent),
      },
      // Side Menu Layout
      {
        path: 'side-menu-layout',
        loadComponent: () =>
          import(
            './modules/admin/settings/menus-manager/menu-manager/menu-manager.component'
          ).then((m) => m.MenuManagerComponent),
        canActivate: [AuthGuard],
        data: { title: 'Side Menu Edit', animation: 'isLeft' },
      },
      {
        path: 'item-type-category-assignment',
        loadComponent: () =>
          import(
            './modules/admin/products/item-type/item-type-category-assignment/item-type-category-assignment.component'
          ).then((m) => m.ItemTypeCategoryAssignmentComponent),
        canActivate: [AuthGuard],
        data: { title: 'Item Type Category', animation: 'isLeft' },
      },
      // Printing
      {
        path: 'label1by8',
        loadComponent: () =>
          import(
            './modules/admin/settings/printing/label1by8/label1by8.component'
          ).then((m) => m.Label1by8Component),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Geo-location
      {
        path: 'location',
        loadComponent: () =>
          import(
            './shared/widgets/ionic-geo-location/ionic-geo-location.component'
          ).then((m) => m.IonicGeoLocationComponent),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Strains
      {
        path: 'strains',
        loadComponent: () =>
          import(
            './modules/admin/metrc/packages/strains-add/strains-add.component'
          ).then((m) => m.StrainsAddComponent),
        canActivate: [AuthGuard],
        data: { title: 'Strains', animation: 'isLeft' },
      },
      // Keypad
      {
        path: 'keypad',
        loadComponent: () =>
          import('./shared/widgets/key-pad/key-pad.component').then(
            (m) => m.KeyPadComponent
          ),
        canActivate: [AuthGuard],
        data: { animation: 'isLeft' },
      },
      // Company Edit
      {
        path: 'company-edit',
        loadComponent: () =>
          import('./modules/admin/company-edit/company-edit.component').then(
            (m) => m.CompanyEditComponent
          ),
        canActivate: [AuthGuard],
        data: { title: 'Company Edit', animation: 'isLeft' },
      },
      // Tier Menu
      {
        path: 'view-tier-menu',
        loadComponent: () =>
          import(
            './modules/menu/tierMenu/tier-prices/tier-prices.component'
          ).then((m) => m.TierPricesComponent),
        canActivate: [AuthGuard],
        data: { title: 'Tier Menu', animation: 'isLeft' },
      },
      // POS Order Schedule
      {
        path: 'pos-order-schedule',
        loadComponent: () =>
          import(
            './modules/posorders/posorder-schedule/posorder-schedule.component'
          ).then((m) => m.POSOrderScheduleComponent),
        canActivate: [AuthGuard],
        data: { title: 'Schedule Order', animation: 'isLeft' },
      },
    ],
  },
  // Menu Board
  {
    path: 'menu-board',
    loadComponent: () =>
      import(
        './modules/admin/grid-menu-layout/grid-manager/grid-manager.component'
      ).then((m) => m.GridManagerComponent),
    children: [
      {
        path: 'grid-menu-layout',
        loadComponent: () =>
          import(
            './modules/admin/grid-menu-layout/grid-menu-layout.component'
          ).then((m) => m.GridMenuLayoutComponent),
        data: { title: 'Menu Board Layout', animation: 'isLeft' },
      },
    ],
  },
  // Additional Routes
  {
    path: 'blog-post-list',
    loadComponent: () =>
      import(
        './shared/widgets/blog-post-list/blog-post-list.component'
      ).then((m) => m.BlogPostListComponent),
    data: { title: 'BlogPosts', animation: 'isLeft' },
  },
  {
    path: 'view-tvpricetiers',
    loadComponent: () =>
      import(
        './modules/tv-menu/tv-price-specials/tv-price-specials.component'
      ).then((m) => m.TvPriceSpecialsComponent),
    data: { title: 'Tiers', animation: 'isLeft' },
  },
  {
    path: 'view-price-tiers',
    loadComponent: () =>
      import(
        './modules/menu/tierMenu/tier-prices/tier-prices.component'
      ).then((m) => m.TierPricesComponent),
    data: { title: 'Price Tiers', animation: 'isLeft' },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: { title: 'Pointless Login', animation: 'isLeft' },
  },
  // Authentication
  {
    path: 'changepassword',
    loadComponent: () =>
      import(
        './modules/login/changepassword/changepassword.component'
      ).then((m) => m.ChangepasswordComponent),
    data: { title: 'Change Password', animation: 'isLeft' },
  },
  {
    path: 'resetpassword',
    loadComponent: () =>
      import(
        './modules/login/resetpassword/resetpassword.component'
      ).then((m) => m.ResetpasswordComponent),
    data: { title: 'Reset Password', animation: 'isLeft' },
  },
  {
    path: 'register-user',
    loadComponent: () =>
      import(
        './modules/login/registration/register-account-existing-user-with-token/register-account-existing-user-with-token.component'
      ).then((m) => m.RegisterAccountExistingUserWithTokenComponent),
    data: { animation: 'isLeft' },
  },
  {
    path: 'register-token',
    loadComponent: () =>
      import(
        './modules/login/registration/register-account-main/register-account-main.component'
      ).then((m) => m.RegisterAccountMainComponent),
    data: { animation: 'isLeft' },
  },
  {
    path: 'api-setting',
    loadComponent: () =>
      import('./modules/login/apisetting/apisetting.component').then(
        (m) => m.APISettingComponent
      ),
    data: { title: 'API Setting', animation: 'isLeft' },
  },
  {
    path: 'apisetting',
    loadComponent: () =>
      import('./modules/login/apisetting/apisetting.component').then(
        (m) => m.APISettingComponent
      ),
    data: { title: 'API Setting', animation: 'isLeft' },
  },
  // App Gate
  {
    path: 'appgate',
    loadComponent: () =>
      import('./modules/app-gate/app-gate/app-gate.component').then(
        (m) => m.AppGateComponent
      ),
    data: { animation: 'isLeft' },
  },
  // Widgets
  {
    path: 'menu-modal',
    loadComponent: () =>
      import(
        './modules/menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component'
      ).then((m) => m.MenuItemModalComponent),
    data: { animation: 'isLeft' },
  },
  {
    path: 'app-widget-card',
    loadComponent: () =>
      import('./modules/admin/reports/card/card.component').then(
        (m) => m.CardComponent
      ),
    data: { animation: 'isLeft' },
  },
  {
    path: 'overLay',
    loadComponent: () =>
      import('./shared/widgets/over-lay/over-lay.component').then(
        (m) => m.OverLayComponent
      ),
    data: { animation: 'isLeft' },
  },
  {
    path: 'logo',
    loadComponent: () =>
      import('./shared/widgets/logo/logo.component').then(
        (m) => m.LogoComponent
      ),
    data: { animation: 'isLeft' },
  },
  {
    path: 'background',
    loadComponent: () =>
      import('./shared/widgets/background-cover/background-cover.component').then(
        (m) => m.BackgroundCoverComponent
      ),
    data: { animation: 'isLeft' },
  },
  {
    path: 'chat-app',
    loadComponent: () =>
      import('./shared/widgets/three-cxfab/three-cxfab.component').then(
        (m) => m.ThreeCXFabComponent
      ),
    data: { animation: 'isLeft' },
  },
  // Page Not Found
  {
    path: '**',
    loadComponent: () =>
      import(
        './shared/widgets/page-not-found/page-not-found.component'
      ).then((m) => m.PageNotFoundComponent),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: CustomReuseStrategy,
      useClass: CustomReuseStrategy,
    },
  ],
})
export class AppRoutingModule {}
