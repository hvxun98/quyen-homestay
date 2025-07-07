export const branches = [
  {
    label: 'Hà Nội',
    value: 1
  },
  {
    label: 'TP HCM',
    value: 2
  },
  {
    label: 'Đà Nẵng',
    value: 3
  }
];

export const privileges = [
  {
    Id: 1,
    Name: 'Hệ thống',
    Functions: [
      {
        Id: 'Branch',
        Name: 'Chi nhánh',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'Branch_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Branch_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Branch_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Branch_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'ExpensesOther',
        Name: 'Chi phí nhập hàng',
        NumberOrder: 6,
        Ops: [
          {
            Id: 'ExpensesOther_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'ExpensesOther_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'ExpensesOther_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'ExpensesOther_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'PosParameter',
        Name: 'Thiết lập',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'PosParameter_Update',
            Name: 'Cập nhật'
          }
        ]
      },
      {
        Id: 'Surcharge',
        Name: 'Thu khác',
        NumberOrder: 5,
        Ops: [
          {
            Id: 'Surcharge_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Surcharge_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Surcharge_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Surcharge_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'PrintTemplate',
        Name: 'Mẫu in',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'PrintTemplate_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'PrintTemplate_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'PrintTemplate_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'User',
        Name: 'Người dùng',
        NumberOrder: 3,
        Ops: [
          {
            Id: 'User_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'User_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'User_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'User_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'User_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'SmsEmailTemplate',
        Name: 'SMS / Email',
        NumberOrder: 6,
        Ops: [
          {
            Id: 'SmsEmailTemplate_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'SmsEmailTemplate_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'SmsEmailTemplate_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'SmsEmailTemplate_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'SmsEmailTemplate_SendSMS',
            Name: 'Gửi SMS'
          },
          {
            Id: 'SmsEmailTemplate_SendEmail',
            Name: 'Gửi Email'
          },
          {
            Id: 'SmsEmailTemplate_SendZalo',
            Name: 'Gửi tin nhắn Zalo'
          }
        ]
      },
      {
        Id: 'AuditTrail',
        Name: 'Lịch sử thao tác',
        NumberOrder: 7,
        Ops: [
          {
            Id: 'AuditTrail_Read',
            Name: 'Xem'
          }
        ]
      },
      {
        Id: 'DashBoard',
        Name: 'Tổng quan',
        NumberOrder: 8,
        Ops: [
          {
            Id: 'DashBoard_Read',
            Name: 'Xem'
          }
        ]
      }
    ]
  },
  {
    Id: 2,
    Name: 'Hàng hóa',
    Functions: [
      {
        Id: 'Manufacturing',
        Name: 'Sản xuất',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'Manufacturing_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Manufacturing_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Manufacturing_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Manufacturing_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Manufacturing_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'Product',
        Name: 'Danh mục sản phẩm',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'Product_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Product_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Product_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Product_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Product_PurchasePrice',
            Name: 'Giá nhập'
          },
          {
            Id: 'Product_Cost',
            Name: 'Giá vốn'
          },
          {
            Id: 'Product_Import',
            Name: 'Import'
          },
          {
            Id: 'Product_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'PriceBook',
        Name: 'Thiết lập giá',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'PriceBook_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'PriceBook_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'PriceBook_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'PriceBook_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'PriceBook_Import',
            Name: 'Import'
          },
          {
            Id: 'PriceBook_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'StockTake',
        Name: 'Kiểm kho',
        NumberOrder: 3,
        Ops: [
          {
            Id: 'StockTake_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'StockTake_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'StockTake_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'StockTake_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'StockTake_Inventory',
            Name: 'Xem tồn kho'
          },
          {
            Id: 'StockTake_Clone',
            Name: 'Sao chép'
          },
          {
            Id: 'StockTake_Finish',
            Name: 'Hoàn thành'
          }
        ]
      },
      {
        Id: 'WarrantyProduct',
        Name: 'Phiếu bảo hành',
        NumberOrder: 3,
        Ops: [
          {
            Id: 'WarrantyProduct_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'WarrantyProduct_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'WarrantyProduct_Export',
            Name: 'Xuất file'
          }
        ]
      }
    ]
  },
  {
    Id: 3,
    Name: 'Giao dịch',
    Functions: [
      {
        Id: 'DamageItem',
        Name: 'Xuất hủy',
        NumberOrder: 8,
        Ops: [
          {
            Id: 'DamageItem_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'DamageItem_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'DamageItem_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'DamageItem_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'DamageItem_Clone',
            Name: 'Sao chép'
          },
          {
            Id: 'DamageItem_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'Invoice',
        Name: 'Hóa đơn',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'Invoice_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Invoice_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Invoice_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Invoice_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Invoice_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'Invoice_ReadOnHand',
            Name: 'Xem tồn kho'
          },
          {
            Id: 'Invoice_ChangePrice',
            Name: 'Thay đổi giá bán'
          },
          {
            Id: 'Invoice_ChangeUnitPrice',
            Name: 'Thay đổi đơn giá'
          },
          {
            Id: 'Invoice_ChangeDiscount',
            Name: 'Cập nhật giảm giá hóa đơn'
          },
          {
            Id: 'Invoice_ModifySeller',
            Name: 'Cập nhật người bán'
          },
          {
            Id: 'Invoice_UpdateCompleted',
            Name: 'Cập nhật hóa đơn hoàn thành'
          },
          {
            Id: 'Invoice_RepeatPrint',
            Name: 'In lại'
          },
          {
            Id: 'Invoice_CopyInvoice',
            Name: 'Sao chép'
          },
          {
            Id: 'Invoice_UpdateWarranty',
            Name: 'Cập nhật hạn bảo hành'
          },
          {
            Id: 'Invoice_PublishEInvoice',
            Name: 'Phát hành hóa đơn điện tử'
          },
          {
            Id: 'Invoice_Import',
            Name: 'Import'
          }
        ]
      },
      {
        Id: 'Order',
        Name: 'Đặt hàng',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'Order_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Order_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Order_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Order_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Order_RepeatPrint',
            Name: 'In lại'
          },
          {
            Id: 'Order_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'Order_MakeInvoice',
            Name: 'Tạo hóa đơn'
          },
          {
            Id: 'Order_CopyOrder',
            Name: 'Sao chép'
          },
          {
            Id: 'Order_UpdateWarranty',
            Name: 'Cập nhật hạn bảo hành'
          },
          {
            Id: 'Order_Import',
            Name: 'Import'
          }
        ]
      },
      {
        Id: 'OrderSupplier',
        Name: 'Đặt hàng nhập',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'OrderSupplier_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'OrderSupplier_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'OrderSupplier_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'OrderSupplier_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'OrderSupplier_RepeatPrint',
            Name: 'In lại'
          },
          {
            Id: 'OrderSupplier_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'OrderSupplier_MakePurchase',
            Name: 'Tạo phiếu nhập'
          },
          {
            Id: 'OrderSupplier_Clone',
            Name: 'Sao chép'
          }
        ]
      },
      {
        Id: 'Transfer',
        Name: 'Chuyển hàng',
        NumberOrder: 7,
        Ops: [
          {
            Id: 'Transfer_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Transfer_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Transfer_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Transfer_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Transfer_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'Transfer_Clone',
            Name: 'Sao chép'
          },
          {
            Id: 'Transfer_Import',
            Name: 'Import'
          },
          {
            Id: 'Transfer_Finish',
            Name: 'Hoàn thành'
          }
        ]
      },
      {
        Id: 'PurchaseOrder',
        Name: 'Nhập hàng',
        NumberOrder: 5,
        Ops: [
          {
            Id: 'PurchaseOrder_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'PurchaseOrder_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'PurchaseOrder_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'PurchaseOrder_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'PurchaseOrder_UpdatePurchaseOrder',
            Name: 'Cập nhật phiếu nhập hoàn thành'
          },
          {
            Id: 'PurchaseOrder_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'PurchaseOrder_Clone',
            Name: 'Sao chép'
          }
        ]
      },
      {
        Id: 'PurchaseReturn',
        Name: 'Trả hàng nhập',
        NumberOrder: 6,
        Ops: [
          {
            Id: 'PurchaseReturn_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'PurchaseReturn_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'PurchaseReturn_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'PurchaseReturn_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'PurchaseReturn_Clone',
            Name: 'Sao chép'
          }
        ]
      },
      {
        Id: 'Return',
        Name: 'Trả hàng',
        NumberOrder: 3,
        Ops: [
          {
            Id: 'Return_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Return_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Return_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Return_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Return_RepeatPrint',
            Name: 'In lại'
          },
          {
            Id: 'Return_CopyReturn',
            Name: 'Sao chép'
          },
          {
            Id: 'Return_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'WarrantyRepairingProduct',
        Name: 'Hàng sửa chữa',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'WarrantyRepairingProduct_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'WarrantyRepairingProduct_Update',
            Name: 'Cập nhật'
          }
        ]
      },
      {
        Id: 'WarrantyOrder',
        Name: 'Yêu cầu sửa chữa',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'WarrantyOrder_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'WarrantyOrder_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'WarrantyOrder_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'WarrantyOrder_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'WarrantyOrder_Print',
            Name: 'In lại'
          },
          {
            Id: 'WarrantyOrder_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'WarrantyOrder_CreateInvoice',
            Name: 'Tạo hóa đơn'
          },
          {
            Id: 'WarrantyOrder_UpdateExpire',
            Name: 'Cập nhật hạn bảo hành'
          },
          {
            Id: 'WarrantyOrder_ViewPrice',
            Name: 'Xem giá bán'
          }
        ]
      }
    ]
  },
  {
    Id: 4,
    Name: 'Đối tác',
    Functions: [
      {
        Id: 'Customer',
        Name: 'Khách hàng',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'Customer_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Customer_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Customer_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Customer_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Customer_ViewPhone',
            Name: 'Điện thoại'
          },
          {
            Id: 'Customer_Import',
            Name: 'Import'
          },
          {
            Id: 'Customer_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'Customer_UpdateGroup',
            Name: 'Cập nhật nhóm KH'
          }
        ]
      },
      {
        Id: 'CustomerPointAdjustment',
        Name: 'Tích điểm KH',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'CustomerPointAdjustment_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'CustomerPointAdjustment_Update',
            Name: 'Cập nhật'
          }
        ]
      },
      {
        Id: 'CustomerAdjustment',
        Name: 'Công nợ KH',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'CustomerAdjustment_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'CustomerAdjustment_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'CustomerAdjustment_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'CustomerAdjustment_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'SupplierAdjustment',
        Name: 'Công nợ NCC',
        NumberOrder: 6,
        Ops: [
          {
            Id: 'SupplierAdjustment_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'SupplierAdjustment_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'SupplierAdjustment_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'SupplierAdjustment_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'DeliveryAdjustment',
        Name: 'Công nợ đối tác GH',
        NumberOrder: 9,
        Ops: [
          {
            Id: 'DeliveryAdjustment_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'DeliveryAdjustment_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'DeliveryAdjustment_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'DeliveryAdjustment_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'Supplier',
        Name: 'Nhà cung cấp        ',
        NumberOrder: 5,
        Ops: [
          {
            Id: 'Supplier_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Supplier_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Supplier_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Supplier_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Supplier_MobilePhone',
            Name: 'Điện thoại'
          },
          {
            Id: 'Supplier_Import',
            Name: 'Import'
          },
          {
            Id: 'Supplier_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'PartnerDelivery',
        Name: 'Đối tác giao hàng',
        NumberOrder: 8,
        Ops: [
          {
            Id: 'PartnerDelivery_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'PartnerDelivery_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'PartnerDelivery_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'PartnerDelivery_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'PartnerDelivery_Import',
            Name: 'Import'
          },
          {
            Id: 'PartnerDelivery_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'PurchasePayment',
        Name: 'Thanh toán NCC, ĐTGH',
        NumberOrder: 7,
        Ops: [
          {
            Id: 'PurchasePayment_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'PurchasePayment_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'PurchasePayment_Update',
            Name: 'Cập nhật'
          }
        ]
      },
      {
        Id: 'Payment',
        Name: 'Thanh toán KH',
        NumberOrder: 3,
        Ops: [
          {
            Id: 'Payment_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Payment_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Payment_Update',
            Name: 'Cập nhật'
          }
        ]
      }
    ]
  },
  {
    Id: 5,
    Name: 'Báo cáo',
    Functions: [
      {
        Id: 'FinancialReport',
        Name: 'Tài chính',
        NumberOrder: 9,
        Ops: [
          {
            Id: 'FinancialReport_SalePerformanceReport',
            Name: 'KQ HĐ Kinh Doanh'
          }
        ]
      },
      {
        Id: 'UserReport',
        Name: 'Nhân viên',
        NumberOrder: 7,
        Ops: [
          {
            Id: 'UserReport_ByProfitReport',
            Name: 'Lợi nhuận'
          },
          {
            Id: 'UserReport_ByUserReport',
            Name: 'Hàng bán theo NV'
          },
          {
            Id: 'UserReport_BySaleReport',
            Name: 'Bán hàng'
          }
        ]
      },
      {
        Id: 'SaleReport',
        Name: 'Bán hàng',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'SaleReport_SaleByUser',
            Name: 'Nhân viên'
          },
          {
            Id: 'SaleReport_SaleProfitByInvoice',
            Name: 'Lợi nhuận'
          },
          {
            Id: 'SaleReport_SaleDiscountByInvoice',
            Name: 'Giảm giá hóa đơn'
          },
          {
            Id: 'SaleReport_SaleByRefund',
            Name: 'Trả hàng'
          },
          {
            Id: 'SaleReport_SaleByTime',
            Name: 'Thời gian'
          },
          {
            Id: 'SaleReport_BranchSaleReport',
            Name: 'Chi nhánh'
          }
        ]
      },
      {
        Id: 'OrderReport',
        Name: 'Đặt hàng',
        NumberOrder: 3,
        Ops: [
          {
            Id: 'OrderReport_ByDocReport',
            Name: 'Giao dịch'
          },
          {
            Id: 'OrderReport_ByProductReport',
            Name: 'Hàng hóa'
          }
        ]
      },
      {
        Id: 'EndOfDayReport',
        Name: 'Cuối ngày',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'EndOfDayReport_EndOfDaySynthetic',
            Name: 'Tổng hợp'
          },
          {
            Id: 'EndOfDayReport_EndOfDayProduct',
            Name: 'Hàng hóa'
          },
          {
            Id: 'EndOfDayReport_EndOfDayCashFlow',
            Name: 'Thu chi'
          },
          {
            Id: 'EndOfDayReport_EndOfDayDocument',
            Name: 'Bán hàng'
          }
        ]
      },
      {
        Id: 'SupplierReport',
        Name: 'Nhà cung cấp',
        NumberOrder: 6,
        Ops: [
          {
            Id: 'SupplierReport_BigByLiabilitiesReport',
            Name: 'Công nợ'
          },
          {
            Id: 'SupplierReport_SupplierInforReport',
            Name: 'Hàng nhập theo NCC'
          },
          {
            Id: 'SupplierReport_PurchaseOrderReport',
            Name: 'Nhập hàng'
          }
        ]
      },
      {
        Id: 'SaleChannelReport',
        Name: 'Kênh bán hàng',
        NumberOrder: 8,
        Ops: [
          {
            Id: 'SaleChannelReport_ByProduct',
            Name: 'Hàng bán theo kênh'
          },
          {
            Id: 'SaleChannelReport_ByProfit',
            Name: 'Lợi nhuận'
          },
          {
            Id: 'SaleChannelReport_BySale',
            Name: 'Bán hàng'
          }
        ]
      },
      {
        Id: 'ProductReport',
        Name: 'Hàng hóa',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'ProductReport_ProducStockInOutStock',
            Name: 'Giá trị kho'
          },
          {
            Id: 'ProductReport_ProductByCustomer',
            Name: 'Khách theo hàng bán'
          },
          {
            Id: 'ProductReport_ProductByDamageItem',
            Name: 'Xuất hủy'
          },
          {
            Id: 'ProductReport_ProductBySupplier',
            Name: 'NCC theo hàng nhập'
          },
          {
            Id: 'ProductReport_ProductByUser',
            Name: 'Nhân viên theo hàng bán'
          },
          {
            Id: 'ProductReport_ProducInOutStock',
            Name: 'Xuất nhập tồn'
          },
          {
            Id: 'ProductReport_ProducInOutStockDetail',
            Name: 'Xuất nhập tồn chi tiết'
          },
          {
            Id: 'ProductReport_ProductByProfit',
            Name: 'Lợi nhuận'
          },
          {
            Id: 'ProductReport_ProductBySale',
            Name: 'Bán hàng'
          }
        ]
      },
      {
        Id: 'CustomerReport',
        Name: 'Khách hàng',
        NumberOrder: 5,
        Ops: [
          {
            Id: 'CustomerReport_BigCustomerDebt',
            Name: 'Công nợ'
          },
          {
            Id: 'CustomerReport_CustomerProduct',
            Name: 'Hàng bán theo khách'
          },
          {
            Id: 'CustomerReport_CustomerSale',
            Name: 'Bán hàng'
          },
          {
            Id: 'CustomerReport_CustomerProfit',
            Name: 'Lợi nhuận'
          }
        ]
      }
    ]
  },
  {
    Id: 6,
    Name: 'Sổ quỹ',
    Functions: [
      {
        Id: 'BankAccount',
        Name: 'Tài khoản ngân hàng',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'BankAccount_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'BankAccount_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'BankAccount_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'CashFlow',
        Name: 'Sổ quỹ',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'CashFlow_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'CashFlow_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'CashFlow_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'CashFlow_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'CashFlow_Export',
            Name: 'Xuất file'
          }
        ]
      }
    ]
  },
  {
    Id: 7,
    Name: 'Khuyến mại',
    Functions: [
      {
        Id: 'Campaign',
        Name: 'Chương trình khuyến mại',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'Campaign_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Campaign_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Campaign_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Campaign_Delete',
            Name: 'Xóa'
          }
        ]
      }
    ]
  },
  {
    Id: 8,
    Name: 'Voucher',
    Functions: [
      {
        Id: 'VoucherCampaign',
        Name: 'Quản lý voucher',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'VoucherCampaign_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'VoucherCampaign_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'VoucherCampaign_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'VoucherCampaign_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'VoucherCampaign_Release',
            Name: 'Phát hành'
          }
        ]
      }
    ]
  },
  {
    Id: 9,
    Name: 'Nhân viên',
    Functions: [
      {
        Id: 'EmployeeLimit',
        Name: 'Không cho phép xem chấm công, tính lương của nhân viên khác',
        NumberOrder: 14,
        Ops: [
          {
            Id: 'EmployeeLimit_Read',
            Name: 'Xem DS'
          }
        ]
      },
      {
        Id: 'Clocking',
        Name: 'Lịch làm việc',
        NumberOrder: 2,
        Ops: [
          {
            Id: 'Clocking_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Clocking_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Clocking_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Clocking_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Clocking_Copy',
            Name: 'Sao chép'
          },
          {
            Id: 'Clocking_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'Clocking_SetupTimekeeping',
            Name: 'Cập nhật giờ chấm công'
          }
        ]
      },
      {
        Id: 'Commission',
        Name: 'Thiết lập hoa hồng',
        NumberOrder: 4,
        Ops: [
          {
            Id: 'Commission_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Commission_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Commission_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Commission_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Commission_Export',
            Name: 'Xuất file'
          },
          {
            Id: 'Commission_Import',
            Name: 'Import'
          }
        ]
      },
      {
        Id: 'Employee',
        Name: 'Nhân viên',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'Employee_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Employee_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Employee_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Employee_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Employee_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'FingerMachine',
        Name: 'Máy chấm công vân tay',
        NumberOrder: 11,
        Ops: [
          {
            Id: 'FingerMachine_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'FingerMachine_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'FingerMachine_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'FingerMachine_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'FingerPrint',
        Name: 'Tài khoản chấm công',
        NumberOrder: 12,
        Ops: [
          {
            Id: 'FingerPrint_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'FingerPrint_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'FingerPrint_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'FingerPrintLog',
        Name: 'Dữ liệu chấm công',
        NumberOrder: 13,
        Ops: [
          {
            Id: 'FingerPrintLog_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'FingerPrintLog_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'GeneralSettingClocking',
        Name: 'Thiết lập nhân viên > Chấm công',
        NumberOrder: 16,
        Ops: [
          {
            Id: 'GeneralSettingClocking_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'GeneralSettingClocking_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'GeneralSettingClocking_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'GeneralSettingClocking_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'GeneralSettingTimesheet',
        Name: 'Thiết lập nhân viên > Tính lương',
        NumberOrder: 17,
        Ops: [
          {
            Id: 'GeneralSettingTimesheet_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'GeneralSettingTimesheet_Update',
            Name: 'Cập nhật'
          }
        ]
      },
      {
        Id: 'GeneralSettingPayrateTemplate',
        Name: 'Thiết lập nhân viên > Mẫu lương',
        NumberOrder: 18,
        Ops: [
          {
            Id: 'GeneralSettingPayrateTemplate_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'GeneralSettingPayrateTemplate_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'GeneralSettingPayrateTemplate_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'GeneralSettingPayrateTemplate_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'GeneralSettingHoliday',
        Name: 'Thiết lập nhân viên > Quản lý lễ tết',
        NumberOrder: 19,
        Ops: [
          {
            Id: 'GeneralSettingHoliday_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'GeneralSettingHoliday_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'GeneralSettingHoliday_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'GeneralSettingHoliday_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'PayRate',
        Name: 'Mức lương',
        NumberOrder: 5,
        Ops: [
          {
            Id: 'PayRate_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'PayRate_Update',
            Name: 'Cập nhật'
          }
        ]
      },
      {
        Id: 'Paysheet',
        Name: 'Bảng lương NV',
        NumberOrder: 7,
        Ops: [
          {
            Id: 'Paysheet_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Paysheet_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Paysheet_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Paysheet_Delete',
            Name: 'Xóa'
          },
          {
            Id: 'Paysheet_Complete',
            Name: 'Chốt lương'
          },
          {
            Id: 'Paysheet_Export',
            Name: 'Xuất file'
          }
        ]
      },
      {
        Id: 'PayslipPayment',
        Name: 'Thanh toán NV',
        NumberOrder: 6,
        Ops: [
          {
            Id: 'PayslipPayment_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'PayslipPayment_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'PayslipPayment_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'Shift',
        Name: 'Thiết lập nhân viên > Ca làm việc',
        NumberOrder: 15,
        Ops: [
          {
            Id: 'Shift_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'Shift_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'Shift_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'Shift_Delete',
            Name: 'Xóa'
          }
        ]
      },
      {
        Id: 'EmployeeAdjustment',
        Name: 'Công nợ NV',
        NumberOrder: 10,
        Ops: [
          {
            Id: 'EmployeeAdjustment_Read',
            Name: 'Xem DS'
          }
        ]
      }
    ]
  },
  {
    Id: 10,
    Name: 'Coupon',
    Functions: [
      {
        Id: 'CouponCampaign',
        Name: 'Quản lý coupon',
        NumberOrder: 1,
        Ops: [
          {
            Id: 'CouponCampaign_Read',
            Name: 'Xem DS'
          },
          {
            Id: 'CouponCampaign_Create',
            Name: 'Thêm mới'
          },
          {
            Id: 'CouponCampaign_Update',
            Name: 'Cập nhật'
          },
          {
            Id: 'CouponCampaign_Delete',
            Name: 'Xóa'
          }
        ]
      }
    ]
  }
];
