import { Injectable } from "@angular/core";

@Injectable()
export class AppService {
  MildStone: string = "";
  Template = `<div contentEditable="true" id="main-content" class="selectable sub-root">
                  <div contentEditable="true" class="selectable content-dv">
                      <div contentEditable="true" class="selectable array-header" name="collapse-handler">
                      <a name="actionlink" class="actionlink">
                        <img name="minus" class="json-icon" src="assets/fonts/minus.svg" />
                      </a>  
                      <a name="actionlink" class="actionlink d-none">
                        <img name="plus" class="json-icon" src="assets/fonts/plus.svg" />
                      </a>
                        {{Title}}:
                      </div>
                      <div contentEditable="true" class="selectable content-array v-line" name="content-box">
                          {{Dynamic-content}}
                      </div>
                      <div contentEditable="true" class="selectable row-action">
                        <a class="selectable anc-highlighter"><i class="fas fa-highlighter"></i></a>
                        <a class="selectable anc-selector"><i class="far fa-hand-pointer"></i></a>
                      </div>
                    </div>
                  </div>`;
  IsValid(ComplextObject: any): boolean {
    return true;
  }

  GetTemplate() {
    let temp = JSON.stringify(this.Template);
    temp = JSON.parse(temp);
    return temp;
  }

  GetReplatedTemplate(Title: string, Value: string) {
    let Temp = this.GetTemplate();
    let ReplacedTemplate = Temp.replace("{{Title}}", Title).replace(
      "{{Dynamic-content}}",
      Value
    );
    return ReplacedTemplate;
  }

  CreateJsonTree(ComplextObject: any) {
    let $JsonDataObject: any = null;
    let FullData = this.GetTemplate();
    if (this.IsValid(ComplextObject)) {
      let StringifyObject = JSON.stringify(ComplextObject);
      StringifyObject = JSON.parse(StringifyObject);
      $JsonDataObject = this.ConvertToEmptyGridObjec(StringifyObject);
      FullData = this.GetReplatedTemplate(
        "JSON Object",
        $JsonDataObject["html"]
      );
      $JsonDataObject["html"] = FullData;
    } else {
      FullData = this.GetReplatedTemplate("JSON Object", "{}");
      $JsonDataObject["html"] = FullData;
    }
    return $JsonDataObject;
  }

  CreateJsonObject(ComplextObject: any, MildStone: any) {
    let $JsonDataObject = null;
    this.MildStone = MildStone;
    if (this.IsValid(ComplextObject)) {
      let StringifyObject = JSON.stringify(ComplextObject);
      StringifyObject = JSON.parse(StringifyObject);
      $JsonDataObject = this.ConvertToEmptyGridObjec(StringifyObject);
      $JsonDataObject = $JsonDataObject.data;
    } else {
      $JsonDataObject = ComplextObject;
    }
    return $JsonDataObject;
  }

  IsJsonObject(JsonData: string) {
    let IsJson = false;
    try {
      JSON.parse(JsonData);
      IsJson = true;
    } catch (e) {
      IsJson = false;
    }
    return IsJson;
  }

  ConvertToEmptyGridObjec(ComplextObject: any) {
    let NewData: any = {};
    let $CurrentObject = null;
    let Virtualdom: string = "";
    let StackData = null;
    let InnerTemplate = this.GetTemplate();
    let index = 0;
    let ObjectType = typeof ComplextObject;
    if (ObjectType === "object") {
      let HeaderNames = Object.keys(ComplextObject);
      while (index < HeaderNames.length) {
        $CurrentObject = null;
        $CurrentObject = ComplextObject[HeaderNames[index]];
        if (this.IsJsonObject($CurrentObject)) {
          $CurrentObject = JSON.parse($CurrentObject);
        }
        if (typeof $CurrentObject === "object" && $CurrentObject !== null) {
          if ($CurrentObject instanceof Array) {
            if ($CurrentObject.length > 0) {
              NewData[this.MildStone + HeaderNames[index]] = [];
              let ArrayedTemplate = "";
              let InnerVdom = "";
              let InnerIndex = 0;
              while (InnerIndex < $CurrentObject.length) {
                StackData = null;
                StackData = this.ConvertToEmptyGridObjec(
                  $CurrentObject[InnerIndex]
                );
                ArrayedTemplate = "";
                ArrayedTemplate = this.GetReplatedTemplate(
                  InnerIndex.toString(),
                  StackData["html"]
                );
                StackData["html"] = ArrayedTemplate;
                InnerVdom += StackData["html"];
                if (typeof StackData["data"] === "object") {
                  if (this.MildStone === "" || this.MildStone === null) {
                    NewData[HeaderNames[index]].push(StackData["data"]);
                  } else {
                    NewData[this.MildStone + HeaderNames[index]].push({
                      "BH$$-": StackData["data"]
                    });
                  }
                } else {
                  NewData[HeaderNames[index]].push(StackData["data"]);
                }
                InnerIndex++;
              }
              let Count = HeaderNames.length;
              Virtualdom += `<div contentEditable="true" class="sub-root">
                                    <div contentEditable="true" class="content-dv">
                                        <div contentEditable="true" class="array-header" name="collapse-handler">
                                          <a name="actionlink" class="actionlink">
                                            <img name="minus" class="json-icon" src="assets/fonts/minus.svg" />
                                          </a>  
                                          <a name="actionlink" class="actionlink d-none">
                                            <img name="plus" class="json-icon" src="assets/fonts/plus.svg" />
                                          </a>
                                          <b>${HeaderNames[index]}:</b>
                                          <span contentEditable="true">[${Count}]</span>
                                        </div>
                                        <div contentEditable="true" class="content-array v-line" name="content-box">
                                            ${InnerVdom}
                                        </div>
                                        <div contentEditable="true" class="row-action">
                                          <a class="anc-highlighter"><i class="mdi mdi-select-all"></i></i></a>
                                          <a class="anc-selector"><i class="mdi mdi-cursor-pointer"></i></a>
                                        </div>
                                    </div>
                                </div>`;
            } else {
              let Count = HeaderNames[index].length;
              Virtualdom += `<div contentEditable="true" class="sub-root">
                                    <div contentEditable="true" class="content-dv">
                                        <div contentEditable="true" class="array-header v-line">
                                          <b>${HeaderNames[index]}:</b>
                                          <span contentEditable="true">[${Count}]</span>
                                        </div>
                                        <div contentEditable="true" class="row-action">
                                          <a class="anc-highlighter"><i class="mdi mdi-select-all"></i></i></a>
                                          <a class="anc-selector"><i class="mdi mdi-cursor-pointer"></i></a>
                                        </div>
                                    </div>
                                </div>`;
              NewData[this.MildStone + HeaderNames[index]] = [];
            }
          } else {
            StackData = null;
            StackData = this.ConvertToEmptyGridObjec($CurrentObject);
            let Count = HeaderNames.length;
            Virtualdom += `<div contentEditable="true" class="sub-root">
                                    <div contentEditable="true" class="content-dv">
                                        <div contentEditable="true" class="d-inline">
                                            <b>${HeaderNames[index]}:</b>
                                            <span contentEditable="true">{${Count}}</span>
                                          </div>
                                        <div contentEditable="true" class="sub-root v-line">${StackData["html"]}</div>
                                        <div contentEditable="true" class="row-action">
                                          <a class="anc-highlighter"><i class="mdi mdi-select-all"></i></i></a>
                                          <a class="anc-selector"><i class="mdi mdi-cursor-pointer"></i></a>
                                        </div>
                                    </div>
                                </div>`;
            NewData[this.MildStone + HeaderNames[index]] = StackData["data"];
          }
        } else {
          if (typeof $CurrentObject === "string") {
            if (HeaderNames[index] === "value") {
              Virtualdom += `<div contentEditable="true" class="sub-root">
                                <div contentEditable="true" class="content-dv">
                                    <div contentEditable="true" class="d-inline">
                                        <b>${HeaderNames[index]}:</b>
                                      </div>
                                    <div contentEditable="true" class="content"></div>
                                    <div contentEditable="true" class="row-action">
                                      <a class="anc-highlighter"><i class="mdi mdi-select-all"></i></i></a>
                                      <a class="anc-selector"><i class="mdi mdi-cursor-pointer"></i></a>
                                    </div>                                        
                                </div>
                              </div>`;
              NewData[HeaderNames[index]] = "";
            } else {
              Virtualdom += `<div contentEditable="true" class="sub-root">
                              <div contentEditable="true" class="content-dv">
                                  <div contentEditable="true" class="d-inline">
                                    <b>${HeaderNames[index]}:</b></div>
                                  <div contentEditable="true" class="d-inline content">
                                      ${ComplextObject[HeaderNames[index]]} 
                                  </div>
                                  <div contentEditable="true" class="row-action">
                                    <a class="anc-highlighter"><i class="mdi mdi-select-all"></i></i></a>
                                    <a class="anc-selector"><i class="mdi mdi-cursor-pointer"></i></a>
                                  </div>                                        
                              </div>
                            </div>`;

              NewData[HeaderNames[index]] = ComplextObject[HeaderNames[index]];
            }
          } else {
            Virtualdom += `<div contentEditable="true" class="sub-root">
                                <div contentEditable="true" class="content-dv">
                                    <div contentEditable="true" class="d-inline">
                                      <b>${HeaderNames[index]}:</b></div>
                                    <div contentEditable="true" class="d-inline content">
                                        ${ComplextObject[HeaderNames[index]]}
                                    </div>
                                    <div contentEditable="true" class="row-action">
                                    <a class="anc-highlighter"><i class="mdi mdi-select-all"></i></i></a>
                                    <a class="anc-selector"><i class="mdi mdi-cursor-pointer"></i></a>
                                  </div>                                    
                                </div>
                            </div>`;

            NewData[HeaderNames[index]] = ComplextObject[HeaderNames[index]];
          }
        }
        index++;
      }
    } else {
      return {
        data: ComplextObject,
        html: `<pre class="d-inline content">${ComplextObject}</pre>`
      };
    }
    return { data: NewData, html: Virtualdom };
  }
}
