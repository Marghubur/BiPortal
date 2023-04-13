import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Catagory, Product } from 'src/app/adminmodal/admin-modals';
import { Files } from 'src/app/commonmodal/common-modals';
import { environment } from 'src/environments/environment';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminNotification, AImage, EmailLinkConfig, JImage, PImage, Txt } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewChecked {
  isPageReady: boolean =false;
  submitted: boolean = false;
  isLoading: boolean = false;
  baseUrl: string = "";
  currentProduct: Product = null;
  productForm: FormGroup;
  companyId: number = 0;
  currentCompany: any = null;
  productData: Filter = null;
  catagoryData: Filter = null;
  allProducts: Array<Product> = [];
  fileCollection: Array<any> = [];
  fileList: Array<Files> = [];
  userDetail: any = null;
  uploadedFile: Array<any> = [];
  viewer: any = null;
  productDetail: Product = null;
  orderByTitleNameAsc: boolean = null;
  orderByStockStatusAsc: boolean = null;
  orderByQuantityAsc: boolean = null;
  orderByModalNumAsc: boolean = null;
  orderByBrandAsc: boolean = null;
  orderByPurchasePriceAsc: boolean = null;
  orderByOrderDateAsc: boolean = null;
  catagoryForm: FormGroup;
  allCatagory: Array<Catagory> = [];
  allCatagories: Array<Catagory> = [];
  isCatagoryPageReady: boolean = false;
  currentCatagory: Catagory = null;
  catagoryDetail: Catagory = null;
  orderByGroupIdAsc: boolean = null;
  orderByCatagoryCodeAsc: boolean = null;
  orderByCatagoryDescriptionAsc: boolean = null;

  constructor(private fb: FormBuilder,
              private local: ApplicationStorage,
              private http: AjaxService,
              private nav: iNavigation) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    this.userDetail = this.local.findRecord("UserDetail");
    this.baseUrl = this.http.GetImageBasePath();
    this.currentProduct = new Product();
    this.productDetail = new Product();
    this.productData = new Filter();
    this.catagoryData = new Filter();
    this.catagoryData.PageSize = 5;
    this.currentCatagory = new Catagory();
    this.catagoryDetail = new Catagory();
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = this.currentCompany.CompanyId;
        this.productData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
        this.loadData();
        this.initForm();
      }
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.post('Product/GetAllProducts', this.productData).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        Toast("Record found");
        this.isPageReady = true;
      } else {
      this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  bindData(res) {
    this.allProducts = res.product;
    if (this.allProducts.length > 0)
      this.productData.TotalRecords= this.allProducts[0].Total;
    else
      this.productData.TotalRecords= 0;
    this.allCatagories = res.productCatagory;
  }

  initForm() {
    this.productForm = this.fb.group({
      CompanyId: new FormControl(this.currentCompany.CompanyId),
      StockStatus: new FormControl(this.currentProduct.StockStatus, [Validators.required]),
      Quantity: new FormControl(this.currentProduct.Quantity, [Validators.required]),
      ModalNum: new FormControl(this.currentProduct.ModalNum),
      Brand: new FormControl(this.currentProduct.Brand, [Validators.required]),
      ProductId: new FormControl(this.currentProduct.ProductId),
      SiteUrl: new FormControl(this.currentProduct.SiteUrl),
      MRP: new FormControl(this.currentProduct.MRP),
      CatagoryName: new FormControl(this.currentProduct.CatagoryName, [Validators.required]),
      TitleName: new FormControl(this.currentProduct.TitleName, [Validators.required]),
      SerialNo: new FormControl(this.currentProduct.SerialNo),
      ProductCode: new FormControl(this.currentProduct.ProductCode),
      PurchasePrice: new FormControl(this.currentProduct.PurchasePrice)
    })
  }

  addProductPopUp() {
    this.fileList = [];
    this.fileCollection = [];
    this.uploadedFile = [];
    this.currentProduct = new Product();
    this.initForm();
    $('#manageProductModal').modal('show');
  }

  manageProduct() {
    this.isLoading = true;
    this.submitted = true;
    if (this.productForm.invalid) {
      this.isLoading = false;
      return;
    }
    let formData = new FormData();
    let value = this.productForm.value;
    if (this.fileList.length > 0) {
      let i = 0;
      while (i < this.fileList.length) {
        formData.append(this.fileList[i].FileName, this.fileCollection[i]);
        i++;
      }
    }
    formData.append('fileDetail', JSON.stringify(this.fileList));
    formData.append("productdetail", JSON.stringify(value));
    this.http.post("Product/ProdcutAddUpdate", formData).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        Toast("Product insert/update successfully");
        $('#manageProductModal').modal('hide');
        this.submitted = false;
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  get f() {
    return this.productForm.controls;
  }

  fireBrowserFile() {
    $("#uploaProductImg").click();
  }

  uploadAttachment(fileInput: any) {
    this.fileList = [];
    this.fileCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.AlternateName = "Prodyct_img";
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.ParentFolder = '';
        item.Email = this.userDetail.Email;
        item.UserId = this.userDetail.UserId;
        this.fileList.push(item);
        this.fileCollection.push(file);
        index++;
      };
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  uploadedFilePopUp() {
    $('#viewProductImgModal').modal('show');
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.productData = e;
      this.loadData();
    }
  }

  GetCatagoryFilterResult(e: Filter) {
    if(e != null) {
      this.catagoryData = e;
      this.loadCatagoryData();
    }
  }

  editProductPopUp(item: Product) {
    if (item) {
      this.fileList = [];
      this.fileCollection = [];
      this.uploadedFile = [];
      this.getUploadedFile(item);
      this.currentProduct = item;
      this.initForm();
      $('#manageProductModal').modal('show');
    }
  }

  getUploadedFile(item: Product) {
    if (item.FileIds) {
      this.http.get(`Product/GetProductImages/${item.FileIds}`).then(res => {
        if (res.ResponseBody) {
          this.uploadedFile = res.ResponseBody.Table;
        }
      }).catch(e => {
        ErrorToast(e.message);
      })
    }
  }

  viewFile(file: Files) {
    switch(file.FileExtension) {
      case Txt:
      case JImage:
      case PImage:
      case AImage:
        this.viewer = document.getElementById("productfile-container");
        this.viewer.classList.remove('d-none');
        this.viewer.querySelector('iframe').classList.add('bg-white');
        this.viewer.querySelector('iframe').setAttribute('src',
        `${this.baseUrl}${environment.FolderDelimiter}${file.FilePath}${environment.FolderDelimiter}${file.FileName}`);
    }
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  filterRecords() {
    let delimiter = "";
    this.productData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.productData.reset();

    if(this.productDetail.TitleName !== null && this.productDetail.TitleName !== "") {
      this.productData.SearchString += ` and TitleName like '%${this.productDetail.TitleName}%'`;
        delimiter = "and";
    }

    if(this.productDetail.StockStatus > 0) {
      this.productData.SearchString += ` and StockStatus =${this.productDetail.StockStatus}`;
        delimiter = "and";
    }

    if(this.productDetail.Quantity > 0) {
      this.productData.SearchString += ` and Quantity =${this.productDetail.Quantity}`;
        delimiter = "and";
    }

    if(this.productDetail.ModalNum !== null && this.productDetail.ModalNum !== "") {
      this.productData.SearchString += ` and ModalNum like '%${this.productDetail.ModalNum}%'`;
        delimiter = "and";
    }

    if(this.productDetail.Brand !== null && this.productDetail.Brand !== "") {
      this.productData.SearchString += ` and Brand like '%${this.productDetail.Brand}%'`;
        delimiter = "and";
    }

    if(this.productDetail.PurchasePrice !== null && this.productDetail.PurchasePrice > 0) {
      this.productData.SearchString += ` and PurchasePrice like %${this.productDetail.PurchasePrice}%`;
        delimiter = "and";
    }

    this.loadData();
  }

  resetFilter() {
    this.productData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.productData.PageIndex = 1;
    this.productData.PageSize = 10;
    this.productData.StartIndex = 1;
    this.loadData();
    this.productDetail = new Product();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'TitleName') {
      this.orderByTitleNameAsc = !flag;
      this.orderByStockStatusAsc = null;
      this.orderByQuantityAsc = null;
      this.orderByModalNumAsc = null;
      this.orderByBrandAsc = null;
      this.orderByPurchasePriceAsc = null;
      this.orderByOrderDateAsc = null;
    } else if (FieldName == 'StockStatus') {
      this.orderByTitleNameAsc = null;
      this.orderByStockStatusAsc = !flag;
      this.orderByQuantityAsc = null;
      this.orderByModalNumAsc = null;
      this.orderByBrandAsc = null;
      this.orderByPurchasePriceAsc = null;
      this.orderByOrderDateAsc = null;
    } else if (FieldName == 'Quantity') {
      this.orderByTitleNameAsc = null;
      this.orderByStockStatusAsc = null;
      this.orderByQuantityAsc = !flag;
      this.orderByModalNumAsc = null;
      this.orderByBrandAsc = null;
      this.orderByPurchasePriceAsc = null;
      this.orderByOrderDateAsc = null;
    } else if (FieldName == 'ModalNum') {
      this.orderByTitleNameAsc = null;
      this.orderByStockStatusAsc = null;
      this.orderByQuantityAsc = null;
      this.orderByModalNumAsc = !flag;
      this.orderByBrandAsc = null;
      this.orderByPurchasePriceAsc = null;
      this.orderByOrderDateAsc = null;
    } else if (FieldName == 'Brand') {
      this.orderByTitleNameAsc = null;
      this.orderByStockStatusAsc = null;
      this.orderByQuantityAsc = null;
      this.orderByModalNumAsc = null;
      this.orderByBrandAsc = !flag;
      this.orderByPurchasePriceAsc = null;
      this.orderByOrderDateAsc = null;
    } else if (FieldName == 'PurchasePrice') {
      this.orderByTitleNameAsc = null;
      this.orderByStockStatusAsc = null;
      this.orderByQuantityAsc = null;
      this.orderByModalNumAsc = null;
      this.orderByBrandAsc = null;
      this.orderByPurchasePriceAsc = !flag;
      this.orderByOrderDateAsc = null;
    } else if (FieldName == 'OrderDate') {
      this.orderByTitleNameAsc = null;
      this.orderByStockStatusAsc = null;
      this.orderByQuantityAsc = null;
      this.orderByModalNumAsc = null;
      this.orderByBrandAsc = null;
      this.orderByPurchasePriceAsc = null;
      this.orderByOrderDateAsc = !flag;
    }

    this.productData = new Filter();
    this.productData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.productData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  addCatagoryPopUp() {
    this.loadCatagoryData();
    this.currentCatagory = new Catagory();
    this.initCatagoryForm();
    $('#addCatagoryModal').modal('show');
  }

  loadCatagoryData() {
    this.isCatagoryPageReady = false;
    this.http.post("Product/GetAllCatagory", this.catagoryData).then(res => {
      if (res.ResponseBody) {
        this.bindCatagoryData(res.ResponseBody);
        Toast("Product catagory loaded successfully");
        this.isCatagoryPageReady = true;
      }
    }).catch(e => {
      this.isCatagoryPageReady = true;
    })
  }

  bindCatagoryData(res: any) {
    this.allCatagory = res;
    if (this.allProducts.length > 0)
      this.catagoryData.TotalRecords= this.allCatagory[0].Total;
    else
      this.catagoryData.TotalRecords= 0;
  }

  get m() {
    return this.catagoryForm.controls;
  }

  initCatagoryForm() {
    this.catagoryForm = this.fb.group({
      CatagoryId: new FormControl(this.currentCatagory.CatagoryId, [Validators.required]),
      GroupId: new FormControl(this.currentCatagory.GroupId, [Validators.required]),
      CatagoryCode: new FormControl(this.currentCatagory.CatagoryCode, [Validators.required]),
      CatagoryDescription: new FormControl(this.currentCatagory.CatagoryDescription, [Validators.required]),
    })
  }

  editCatagory(item: Catagory) {
    if (item) {
      this.currentCatagory = item;
      this.initCatagoryForm();
    }
  }

  manageCatagory() {
    this.isLoading = true;
    this.submitted = true;
    if (this.catagoryForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.catagoryForm.value;
    this.http.post("Product/AddUpdateProductCatagory", value).then(res => {
      if (res.ResponseBody) {
        let catetory = this.allCatagories.find(x => x.CatagoryId == value.CatagoryId);
        if (catetory == null) {
          catetory = value;
        } else {
          this.allCatagories.push(value);
        }
        this.bindCatagoryData(res.ResponseBody);
        this.currentCatagory = new Catagory();
        this.initCatagoryForm();
        Toast("Product catagory insert/update successfully");
        this.submitted = false;
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  filterCatagoryRecords() {
    let delimiter = "";
    this.catagoryData.SearchString = `1=1`;
    this.catagoryData.reset();

    if(this.catagoryDetail.CatagoryDescription !== null && this.catagoryDetail.CatagoryDescription !== "") {
      this.catagoryData.SearchString += ` and CatagoryDescription like '%${this.catagoryDetail.CatagoryDescription}%'`;
        delimiter = "and";
    }

    if(this.catagoryDetail.GroupId > 0) {
      this.catagoryData.SearchString += ` and GroupId =${this.catagoryDetail.GroupId}`;
        delimiter = "and";
    }

    if(this.catagoryDetail.CatagoryCode !== null && this.catagoryDetail.CatagoryCode !== "") {
      this.catagoryData.SearchString += ` and CatagoryCode like '%${this.catagoryDetail.CatagoryCode}%'`;
        delimiter = "and";
    }

    this.loadCatagoryData();
  }

  resetCatagoryFilter() {
    this.productData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.productData.PageIndex = 1;
    this.productData.PageSize = 10;
    this.productData.StartIndex = 1;
    this.loadCatagoryData();
    this.catagoryDetail = new Catagory();
  }

  arrangeCatagoryDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'GroupId') {
      this.orderByGroupIdAsc = !flag;
      this.orderByCatagoryCodeAsc = null;
      this.orderByCatagoryDescriptionAsc = null;
    } else if (FieldName == 'CatagoryCode') {
      this.orderByGroupIdAsc = null;
      this.orderByCatagoryCodeAsc = !flag;
      this.orderByCatagoryDescriptionAsc = null;
    } else if (FieldName == 'CatagoryDescription') {
      this.orderByGroupIdAsc = null;
      this.orderByCatagoryCodeAsc = null;
      this.orderByCatagoryDescriptionAsc = !flag;
    }

    this.catagoryData = new Filter();
    this.catagoryData.PageSize = 5;
    this.catagoryData.SortBy = FieldName +" "+ Order;
    this.loadCatagoryData()
  }

  navToEmailLinkConfig() {
    this.nav.navigate(EmailLinkConfig, AdminNotification);
  }

}
