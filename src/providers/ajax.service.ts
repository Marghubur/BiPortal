import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { JwtService, ResponseModel } from "src/auth/jwtService";
import { environment } from "src/environments/environment";

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
    ImageBaseUrl = ImageBaseUrl.replace("/api", "/Files");
    return ImageBaseUrl;
  }

  LoadStaticJson(StaticUrl: string): Observable<any> {
    let JsonData = this.http.get(StaticUrl);
    return JsonData;
  }

  private GetBaseUrl(isJavaFlagOn: boolean) {
    if(isJavaFlagOn)
      return environment.baseSpringUrl;
    else
      return environment.baseDotNetUrl;
  }

  login(Url: string, Param: any, isJavaRoute: boolean = false): Promise<ResponseModel> {
    let url = `${this.GetBaseUrl(isJavaRoute)}${Url}`;
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

  get(Url: string, isJavaRoute: boolean = false): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      let url = `${this.GetBaseUrl(isJavaRoute)}${Url}`;
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

  post(Url: string, Param: any, isJavaRoute: boolean = false): Promise<any> {
    let url = `${this.GetBaseUrl(isJavaRoute)}${Url}`;
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

  put(Url: string, Param: any, isJavaRoute: boolean = false): Promise<any> {
    let url = `${this.GetBaseUrl(isJavaRoute)}${Url}`;
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

  delete(Url: string, Param?: any, isJavaRoute: boolean = false): Promise<any> {
    let url = `${this.GetBaseUrl(isJavaRoute)}${Url}`;
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

  upload(Url: string, Param: any, isJavaRoute: boolean = false): Promise<any> {
    let url = `${this.GetBaseUrl(isJavaRoute)}${Url}`;
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
