import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { CommonService, Toast } from "./common-service/common.service";
import "rxjs/add/operator/map";
import { iNavigation } from "./iNavigation";
import { Observable } from "rxjs";
import { HandleResponseStatus, IsValidResponse, JwtService, ResponseModel } from "src/auth/jwtService";
import { environment } from "src/environments/environment";

@Injectable()
export class AjaxService {
  IsTokenByPass: boolean = true;

  constructor(
    private tokenHelper: JwtService,
    private http: HttpClient,
    private commonService: CommonService,
    private nav: iNavigation
  ) {
    if (environment.production) {
      console.log("[Bottomhalf]: Bottomhalf/builder Running");
    } else {
      console.log("[Bottomhalf]: localhost Running");
    }
  }

  public GetImageBasePath() {
    let ImageBaseUrl = environment.baseUrl.replace("/api", "/Files");
    return ImageBaseUrl;
  }

  LoadStaticJson(StaticUrl: string): Observable<any> {
    let JsonData = this.http.get(StaticUrl);
    this.commonService.HideLoader();
    return JsonData;
  }

  get(Url: string, IsLoaderRequired: boolean = true): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      if (IsLoaderRequired) {
        this.commonService.ShowLoaderByAjax();
      } else {
        this.commonService.ShowLoaderByAjax();
      }
      return this.http
        .get(environment.baseUrl + Url, {
          observe: "response"
        })
        .subscribe(
          (res: any) => {
            if (IsValidResponse(res.body)) {
              resolve(res.body);
            } else {
              resolve(null);
            }
          },
          (error: HttpErrorResponse) => {
            this.commonService.HideLoaderByAjax();
            let flag = HandleResponseStatus(error.status);
            if(!flag) {
              this.nav.navigate("/", null);
            }
            reject(false);
          });
    });
  }

  post(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      this.http
        .post(environment.baseUrl + Url, Param, {
          observe: "response"
        })
        .subscribe(
          (res: HttpResponse<any>) => {
            try {
              if (!IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(null);
            }
            resolve(res.body);
            this.commonService.HideLoaderByAjax();
          },
          error => {
            this.commonService.HideLoaderByAjax();
            let flag = HandleResponseStatus(error.status);
            if(!flag) {
              Toast("Getting some error. Please contact admin.")
            }
            reject(error);
          }
        );
    });
  }

  postRequest(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      this.http
        .post(Url, Param, {
          observe: "response"
        })
        .subscribe(
          (res: HttpResponse<any>) => {
            resolve(res.body);
          },
          error => {
            let flag = HandleResponseStatus(error.status);
            if(!flag) {
              this.nav.navigate("/", null);
            }
            reject(null);
          }
        );
    });
  }

  delete(Url: string, Param?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      this.http.delete(environment.baseUrl + Url, {
        headers: {
          observe: "response",
        },
        body: Param
      })
        .subscribe(
          (res: any) => {
            try {
              if (!IsValidResponse(res)) {
                reject(null);
              }
            } catch (e) {
              reject(null);
            }
            resolve(res);
            this.commonService.HideLoaderByAjax();
          },
          error => {
            this.commonService.HideLoaderByAjax();
            let flag = HandleResponseStatus(error.status);
            if(!flag) {
              this.nav.navigate("/", null);
            }
            reject(null);
          }
        );
    });
  }

  login(Url: string, Param: any): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      if (this.commonService.IsValid(Param)) {
        this.http
          .post(environment.baseUrl + Url, Param, {
            observe: "response"
          })
          .subscribe(
            (res: HttpResponse<any>) => {
              try {
                if (IsValidResponse(res.body)) {
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
                reject(null);
              }
              this.commonService.HideLoaderByAjax();
            },
            error => {
              this.commonService.HideLoaderByAjax();
              let flag = HandleResponseStatus(error.status);
            if(!flag) {
              this.nav.navigate("/", null);
            }
              reject(null);
            }
          );
      }
    });
  }

  upload(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      this.http
        .post(environment.baseUrl + Url, Param, {
          observe: "response"
        })
        .subscribe(
          (res: HttpResponse<any>) => {
            try {
              if (!IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(null);
            }
            resolve(res.body);
            this.commonService.HideLoaderByAjax();
          },
          error => {
            this.commonService.HideLoaderByAjax();
            let flag = HandleResponseStatus(error.status);
            if(!flag) {
              this.nav.navigate("/", null);
            }
            reject(null);
          }
        );
    });
  }
}
