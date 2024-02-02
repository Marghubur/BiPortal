import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { JwtService, ResponseModel } from "src/auth/jwtService";
import { environment } from "src/environments/environment";
import { Filter } from "./userService";
import { pairData } from "src/app/util/iautocomplete/iautocomplete.component";
import { SERVICE } from "./constants";

@Injectable()
export class AjaxService {
  IsTokenByPass: boolean = true;

  constructor(
    private tokenHelper: JwtService,
    private http: HttpClient
  ) {
    if (environment.production) {
      console.log(`[Bottomhalf]: BiPortal Running on ${environment.env}`);
    } else {
      console.log("[Bottomhalf]: BiPortal Running on localhost");
    }
  }

  public GetImageBasePath() {
    let ImageBaseUrl = environment.baseDotNetUrl.replace("/core/api", "/Files");
    ImageBaseUrl = ImageBaseUrl + "Files/";
    return ImageBaseUrl;
  }

  LoadStaticJson(StaticUrl: string): Observable<any> {
    let JsonData = this.http.get(StaticUrl);
    return JsonData;
  }

  private GetBaseUrl(Service: SERVICE, Url: string) {
    let baseUrl = environment.baseDotNetUrl;
    switch (Service) {
      case SERVICE.PROJECT:
      case SERVICE.PERFORMANCE:
      case SERVICE.FILTER:
        baseUrl = environment.baseSpringUrl;
        break;
    }

    baseUrl += "api/" + Service + `/${Url}`;
    return baseUrl;
  }

  async getFilterEmployee(filter: Filter) {
    let result: Array<pairData> = [];
    let response: ResponseModel = await this.post(`filter/employeeFilterByName`, filter, SERVICE.FILTER);
    if (response.ResponseBody && response.ResponseBody instanceof Array) {
      result = response.ResponseBody;
    }

    return result;
  }

  login(Url: string, Param: any, ServiceName: SERVICE = SERVICE.CORE): Promise<ResponseModel> {
    let url = this.GetBaseUrl(ServiceName, Url);
    this.tokenHelper.setCompanyCode(Param.CompanyCode);
    return new Promise((resolve, reject) => {
      this.http
        .post(url, Param, {
          observe: "response"
        }).subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (this.tokenHelper.IsValidResponse(res.body)) {
                let loginData: ResponseModel = res.body;
                if (this.tokenHelper.setLoginDetail(loginData.ResponseBody)) {
                  resolve(res.body);
                } else {
                  resolve(null);
                }
              } else {
                reject(null);
              }
            } catch (e) {
              reject(e);
            } 0
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          }
        });
    });
  }

  get(Url: string, ServiceName: SERVICE = SERVICE.CORE): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      let url = this.GetBaseUrl(ServiceName, Url);
      return this.http
        .get(url, {
          observe: "response"
        })
        .subscribe({
          next: (res: any) => {
            if (this.tokenHelper.IsValidResponse(res.body)) {
              resolve(res.body);
            } else {
              resolve(null);
            }
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          }
        });
    });
  }

  post(Url: string, Param: any, ServiceName: SERVICE = SERVICE.CORE): Promise<any> {
    let url = this.GetBaseUrl(ServiceName, Url);
    return new Promise((resolve, reject) => {
      this.http
        .post(url, Param, {
          observe: "response"
        }).subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(null);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          }
        });
    });
  }

  put(Url: string, Param: any, ServiceName: SERVICE = SERVICE.CORE): Promise<any> {
    let url = this.GetBaseUrl(ServiceName, Url);
    return new Promise((resolve, reject) => {
      this.http
        .put(url, Param, {
          observe: "response"
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          }
        });
    });
  }

  delete(Url: string, Param?: any, ServiceName: SERVICE = SERVICE.CORE): Promise<any> {
    let url = this.GetBaseUrl(ServiceName, Url);
    return new Promise((resolve, reject) => {
      this.http.delete(url, {
        headers: {
          observe: "response",
        },
        body: Param
      }).subscribe({
        next: (res: any) => {
          try {
            if (!this.tokenHelper.IsValidResponse(res)) {
              reject(null);
            }
          } catch (e) {
            reject(e);
          }
          resolve(res);
        },
        error: (e: HttpErrorResponse) => {
          this.tokenHelper.HandleResponseStatus(e);
          reject(e.error);
        }
      });
    });
  }

  upload(Url: string, Param: any, ServiceName: SERVICE = SERVICE.CORE): Promise<any> {
    let url = this.GetBaseUrl(ServiceName, Url);
    return new Promise((resolve, reject) => {
      this.http
        .post(url, Param, {
          observe: "response"
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          }
        });
    });
  }

  forgotPassword(Url: string, Param: any, ServiceName: SERVICE = SERVICE.CORE): Promise<ResponseModel> {
    let url = this.GetBaseUrl(ServiceName, Url);
    this.tokenHelper.setCompanyCode(Param.CompanyCode);
    return new Promise((resolve, reject) => {
      this.http
        .post(url, Param, {
          observe: "response"
        }).subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          }
        });
    });
  }
}


export class ColumnMapping {
  ClassName?: string = null;
  ColumnName: string = null;
  DisplayName: string = null;
  IsHidden?: boolean = false;
  PageName?: string = null;
  Style?: string = null;
}

export interface iconConfig {
  iconName: string;
  fn?: Function
}

export class tableConfig {
  header: Array<ColumnMapping> = [];
  data: Array<any> = [];
  sampleData: Array<any> = [];
  link: Array<iconConfig> = [];
  templates: Array<any> = [];
  totalRecords?: number = null;
  isEnableAction?: boolean = false;
}
