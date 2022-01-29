import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { AjaxService } from "src/providers/ajax.service";
import { Component, OnInit } from "@angular/core";
import { CommonService } from "../../providers/common-service/common.service";
import { iNavigation } from "src/providers/iNavigation";
declare var $:any;
import { Sales, UsersColumn } from "../../providers/constants";

@Component({
  selector: "app-tabledsampledata",
  templateUrl: "./tabledsampledata.component.html",
  styleUrls: ["./tabledsampledata.component.scss"]
})
export class TabledsampledataComponent implements OnInit {
  DynamicTableDetail: any = {};
  NewTableGenerator: Array<any> = [];
  autosearch: string;
  requestedtables: Array<number> = [];
  ZerothIndex: number = 0;

  RelationalTableMapping: Array<any> = [];
  TableMapping: Array<any> = [];
  ScriptRequestObject: any = {};
  ScriptFileName: string = "";
  EnableReferenceFields: boolean = false;

  Tables: Array<string> = [];
  TableColumns: Array<{}> = [];
  TableDetail: any;
  ReferenceTables: Array<any> = [];
  MaximunColumnCount: Array<number> = [];
  FinalTableDetail: Array<any> = [];

  ServerData: any;
  Header: any = [];
  IsStriped: boolean = true;
  CurrentPageName: string = "";
  TotalColumns: number = 0;
  FieldClass: string = "noStyle";
  EnableGenerateOption: boolean = false;
  EnableGenerateButton: boolean = false;
  SelectedOption: string = "";
  PrimaryColumn: number = -1;
  IsEmptyRow: boolean = false;
  IsbuildData: boolean = false;
  TotalHeaders: number = 0;
  TableNames: any;
  TableCollection: Array<any> = [];
  TableNameLabelText: any;
  DynamicTableResult: Array<any> = [];
  IsResultGenerated: boolean = false;
  IsMultitable: boolean = false;
  RequestObject: any;
  DataType: any = {
    data: [],
    placeholder: "Data Type"
  };

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: iNavigation,
    private storage: ApplicationStorage,
    private fb: FormBuilder
  ) {
    this.GetTableCount(1);
    this.autosearch = "eanblesearch";
    this.FillInitialRowDetail();
    this.BindDynamicTableDetail();
    this.TableNames = new FormGroup({
      tableName: new FormControl("")
    });
  }

  ShowColumnsForm() {
    let $FormId = $("#section-2");
    if ($FormId !== null) $FormId.fadeIn();
  }

  HideColumnsForm() {
    let $FormId = $("#section-2");
    if ($FormId !== null) $FormId.hide();
  }

  ShowTableForm() {
    let $FormId = $("#section-1");
    if ($FormId !== null) $FormId.fadeIn();
    let AvailableTables = $("#tableNameContainer").find(
      'input[name="dynamic-table-name"]'
    );

    let index = 0;
    while (index < AvailableTables.length) {
      $(AvailableTables[index]).val("");
      index++;
    }
  }

  HideTableForm() {
    let $FormId = $("#section-1");
    if ($FormId !== null) $FormId.hide();
  }

  BackToSchemaPage() {
    this.HideColumnsForm();
    this.ShowTableForm();
  }

  ActivateCurrentPanel($Current: any) {
    $Current
      .closest("ul")
      .find('a[name="action-anc"]')
      .removeClass("active");
    $Current.addClass("active");
  }

  ActivatePanel(sectionId: string, index: string) {
    let e: any = event;
    this.ActivateCurrentPanel($(e.currentTarget));
    let NextSection = sectionId + Number(index);
    if ($("#" + NextSection).length > 0) {
      $("#section-2")
        .find('div[name="dynamic-grid-section"]')
        .hide();

      $("#section-2")
        .find('div[name="relationtable"]')
        .hide();
      $("#" + NextSection).fadeIn();
    }
  }

  UpdateTableColumns() {
    let IsMultipletable = false;
    let Name = "";
    let $CurrentTarget = $("#section-1");
    let NamesCollection = $("#tableNameContainer").find(
      'input[name="dynamic-table-name"]'
    );
    if (NamesCollection.length > 0) {
      this.commonService.ShowLoader();
      this.TableCollection = [];
      let index = 0;
      if (NamesCollection.length > 1) IsMultipletable = true;
      while (index < NamesCollection.length) {
        Name = NamesCollection[index].value;
        if (this.commonService.IsValidString(Name)) {
          if (this.TableCollection.filter(x => x.name === Name).length === 0) {
            this.TableCollection.push({
              name: Name
            });
          }
        }
        index++;
      }
      setTimeout(() => {
        this.HideTableForm();
        let SectionName = $CurrentTarget.attr("name");
        if (SectionName === "section-1") {
          this.ShowColumnsForm();
        }
        this.commonService.HideLoader();
      }, 500);
      this.IsMultitable = IsMultipletable;
    }
  }

  // EnableColumnInsertArea() {
  //   setTimeout(() => {
  //     this.commonService.OperateAutoPlay();
  //     this.UpdateTableColumns();
  //   }, this.commonService.DefaultTimeout);
  // }

  GenerateTable() {
    this.IsbuildData = true;
  }

  FilterPageData(e: any) {}

  CloseGeneratePopup() {
    this.IsResultGenerated = false;
  }

  CopyToClipboard() {
    let e: any = event;
    let current: any = e.currentTarget;
    let field: any = current.closest("div").querySelector("textarea");
    field.select();
    document.execCommand("copy");
  }

  HoverNextField() {
    let e: any = event;
    $(e.currentTarget)
      .closest("tr")
      .find('input[name="DefaultValue"]')
      .focus();
  }

  AllowNumberOnly(e: any) {
    let $e: any = event;
    if (!this.commonService.NumericOnly(e.which)) {
      if (e.which !== 13) $e.preventDefault();
    }
  }

  BindDynamicTableDetail() {
    this.DynamicTableDetail = {
      grid: UsersColumn,
      url: "GetSqlData",
      SearchStr: "1=1",
      SortBy: "",
      editUrl: Sales,
      action: false
    };
  }

  ngOnInit() {}

  IsValidRow($event: any): boolean {
    let flag = true;
    let ColumnName = $event.find('input[name="ColumnName"]').val();
    if (!this.commonService.IsValidString(ColumnName)) {
      this.commonService.ShowToast("Column Name Required");
      flag = false;
    }

    let DataType = this.commonService.ReadAutoCompleteValue(
      $event.find('app-iautocomplete[name="DataType"]')
    );
    if (!this.commonService.IsValidString(DataType)) {
      this.commonService.ShowToast("Data Type Required");
      flag = false;
    }
    return flag;
  }

  EnableOrDisablePrimaryKey($flag: any, index: any) {
    let e: any = event;
    if ($flag.target.checked) {
      let $enabledRows = $(e.currentTarget)
        .closest("tbody")
        .find('tr[active="1"]');
      if ($enabledRows.length > 0) {
        $(e.currentTarget)
          .closest("tbody")
          .find('tr[active="1"]')
          .find('input[name="IsPrimary"]')
          .prop("checked", false);

        $(e.currentTarget).prop("checked", true);
        $(e.currentTarget)
          .closest("tr")
          .attr("isprimary", 1);
        this.PrimaryColumn = Number(index);
      } else {
        e.preventDefault();
        $(e.currentTarget).prop("checked", false);
      }
    } else {
      $(e.currentTarget)
        .closest("tr")
        .attr("isprimary", 0);
      this.PrimaryColumn = -1;
    }
  }

  EnableOrDisableUniqueKey($flag: any) {
    let e: any = event;
    if ($flag.target.checked) {
      $(e.currentTarget)
        .closest("tr")
        .attr("isunique", 1);
    } else {
      $(e.currentTarget)
        .closest("tr")
        .attr("isunique", 0);
    }
  }

  AddAndEnable() {
    let e: any = event;
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).removeClass("disabled-field");
    //this.AddRow();
  }

  DisableButton() {
    let e: any = event;
    $(e.currentTarget).addClass("disabled-field");
  }

  AddRow() {
    let e: any = event;
    e.stopPropagation();
    e.preventDefault();
    if (this.IsValidRow($(e.currentTarget).closest("tr"))) {
      let NextRow = $(e.currentTarget)
        .closest("tr")
        .next();
      if (NextRow.length === 0) {
        this.NewTableGenerator.push(this.GetRow());
        let $currentEvent = $(e.currentTarget);
        $currentEvent
          .closest("tr")
          .next()
          .find('input[name="ColumnName"]')
          .focus();
      } else {
        NextRow.find('input[name="ColumnName"]').focus();
      }
    }
  }

  HandleRowActivation() {
    let e: any = event;
    this.CheckForDublicateColumnName($(e.currentTarget));
    let value = $(e.currentTarget).val();
    if (value.trim().length > 0) {
      $(e.currentTarget)
        .closest("tr")
        .attr("active", "1");
    } else {
      $(e.currentTarget)
        .closest("tr")
        .attr("active", "0");
    }
  }

  GenerateDynamicTable(Result: any): any {
    let GenerateGridHeader = [];
    let GeneratedRows = [];
    let ResultingDynamicGrid: any = {
      header: [],
      body: []
    };
    if (this.commonService.IsValid(Result)) {
      let TableKey = Object.keys(Result);
      if (Result.length > 0) {
        let FirstRow = Result[0];
        let Columns = Object.keys(FirstRow);
        if (Columns.length > 0) {
          let colIndex = 0;
          while (colIndex < Columns.length) {
            GenerateGridHeader.push({
              ColumnName: Columns[colIndex]
            });
            colIndex++;
          }
        }

        if (Result.length > 15) {
          let index = 0;
          while (index < 15) {
            GeneratedRows.push(Result[index]);
            index++;
          }
        } else {
          GeneratedRows = Result;
        }
      }
    }
    ResultingDynamicGrid["header"] = GenerateGridHeader;
    ResultingDynamicGrid["body"] = GeneratedRows;
    return ResultingDynamicGrid;
  }

  GetValidTables(len: number): Array<{}> {
    let index = 0;
    let ValidTableNames: Array<{}> = [];
    while (index < len) {
      if (
        this.TableDetail[index].Data.filter((x: any) => x.IsPrimay === true).length >
          0 ||
        this.TableDetail[index].Data.filter((x: any) => x.IsUnique === true).length > 0
      ) {
        ValidTableNames.push(this.TableDetail[index]);
      }
      index++;
    }
    return ValidTableNames;
  }

  OpenCloseRelationTable() {
    let e: any = event;
    this.TableMapping = [];
    let TableColumns: Array<string> = [];
    this.TableDetail = null;
    this.TableDetail = this.GetUserInsertedData();
    let TableNames: Array<any> = [];
    this.RelationalTableMapping = [];
    let TableLen = this.TableDetail.length;
    if (TableLen > 0) {
      TableNames = this.GetValidTables(TableLen);
      TableLen = TableNames.length;
      if (TableLen > 0) {
        try {
          this.ActivateCurrentPanel($(e.currentTarget));
          let NameOfTable = "";
          let index = 0;
          while (index < TableLen) {
            NameOfTable = TableNames[index]["TableName"];
            TableColumns = [];
            TableColumns = this.GetColumnNames(NameOfTable);
            if (TableNames.filter(x => x.TableName != NameOfTable).length > 0) {
              if (TableColumns.length > this.MaximunColumnCount.length) {
                let counterIndex = 0;
                this.MaximunColumnCount = [];
                while (counterIndex < TableColumns.length) {
                  this.MaximunColumnCount.push(counterIndex);
                  counterIndex++;
                }
              }
              this.RelationalTableMapping.push({
                index: index + 1,
                tableName: NameOfTable,
                relatedColumns: TableColumns,
                referencedTableNames: TableNames.filter(
                  x => x.TableName != NameOfTable
                ).map(x => x.TableName)
              });
            }
            index++;
          }

          $("#section-2")
            .find('div[name="dynamic-grid-section"]')
            .hide();
          $("#section-2")
            .find('div[name="relationtable"]')
            .fadeIn();
        } catch (e) {
          this.commonService.ShowToast("Encounter internal error.");
        }
      } else {
        this.commonService.ShowToast(
          "To enable table relation you must have to check [PRIMARY] or [UNIQUE] key constraint."
        );
      }
    } else {
      this.commonService.ShowToast("No entry found for any table");
    }
  }

  SelectOptiontype($e: any) {
    let e: any = event;
    this.TableDetail = this.GetUserInsertedData();
    let TableLen = this.TableDetail.length;
    if (TableLen > 0) {
      if ($e.target.value !== null && $e.target.value !== "") {
        this.SelectedOption = $e.target.value;
        if (
          $e.target.value.toLocaleLowerCase().indexOf("completescript") > -1
        ) {
          this.EnableGenerateOption = true;
        } else {
          this.EnableGenerateOption = false;
        }
        this.EnableGenerateButton = true;
      } else {
        this.EnableGenerateButton = false;
        this.EnableGenerateOption = true;
      }
    } else {
      this.commonService.ShowToast("No entry found for any table");
      e.preventDefault();
    }
  }

  EnableColumns() {
    this.ReferenceTables = [];
    let e: any = event;
    let $current: any = e.currentTarget;
    let CurrentSelectedColumn = $current.value;
    let CurrentSelectedTable = $(e.currentTarget)
      .closest("tr")
      .find('input[name="tablename"]')
      .val();

    if (this.commonService.IsValidString(CurrentSelectedColumn)) {
      if (this.TableDetail !== null && this.TableDetail.length > 0) {
        this.ReferenceTables = this.TableDetail.filter(
          (x: any) => x.TableName !== CurrentSelectedTable
        );
      }
    } else {
      this.commonService.ShowToast("Invalid column selected.");
    }
  }

  BindReferenceTable($event: any) {
    let e: any = event;
    if ($event.target.value !== "") {
      $(e.currentTarget)
        .closest("tr")
        .find('select[name="referenceTableName"]')
        .removeAttr("disabled")
        .prop("disabled", false);
      $(e.currentTarget)
        .closest("tr")
        .find('select[name="referenceColumnName"]')
        .removeAttr("disabled", "disabled")
        .prop("disabled", false);
      if ($event != null) {
        let DataType = $(e.currentTarget)
          .find('option[value="' + $event.target.value + '"]')
          .attr("type");
        if (this.commonService.IsValid(DataType)) {
          $(e.currentTarget)
            .closest("td")
            .find('input[name="column-type"]')
            .val(DataType);
        }
      }
    } else {
      this.commonService.ShowToast("Please select column name first.");
      $(e.currentTarget)
        .closest("tr")
        .find('select[name="referenceTableName"]')
        .attr("disabled", "disabled")
        .prop("disabled", true);
      $(e.currentTarget)
        .closest("tr")
        .find('select[name="referenceColumnName"]')
        .attr("disabled", "disabled")
        .prop("disabled", true);
    }
  }

  ReadAllReferenceTableNames($current: any) {
    let SelectedReferencedTableNames = [];
    let ReferenceTableCollection = $($current)
      .closest("tbody")
      .find('select[name="referenceTableName"]');
    if (ReferenceTableCollection.length > 0) {
      let index = 0;
      while (index < ReferenceTableCollection.length) {
        if (
          $(ReferenceTableCollection[index]).val() !== "" &&
          SelectedReferencedTableNames.indexOf(
            $(ReferenceTableCollection[index]).val()
          ) === -1
        )
          SelectedReferencedTableNames.push(
            $(ReferenceTableCollection[index]).val()
          );
        index++;
      }
    }
    return SelectedReferencedTableNames;
  }

  IsChidContainerKey(ParentTableName: string, CurrentTableName: string) {
    let ExistFlag = false;
    let CurrentTable: any = this.TableMapping.filter(
      (x: any) => x.parent === CurrentTableName
    );
    if (CurrentTable.length > 0) {
      CurrentTable = CurrentTable[this.ZerothIndex];
      if (CurrentTable["childs"].indexOf(ParentTableName) !== -1) {
        ExistFlag = true;
      }
    }
    return ExistFlag;
  }

  CheckCircularReference(
    $current: any,
    PassedParentName: string,
    CurrentSelectedTable: string
  ) {
    let e: any = event;
    let ValidFlag = true;
    let ParentTableName: string = PassedParentName;
    let SelectedReferencedTableNames = this.ReadAllReferenceTableNames(
      $current
    );
    if (SelectedReferencedTableNames.length > 0) {
      if (
        this.TableMapping.length === 0 ||
        (this.TableMapping.filter(x => x.parent === ParentTableName).length ===
          0 &&
          !this.IsChidContainerKey(PassedParentName, CurrentSelectedTable))
      ) {
        this.TableMapping.push({
          parent: ParentTableName,
          childs: SelectedReferencedTableNames
        });
      } else {
        if (
          this.TableMapping.filter((x: any) => x.parent === CurrentSelectedTable)
            .length > 0
        ) {
          $(e.currentTarget)
            .find('option[value=""]')
            .attr("selected", "selected")
            .prop("selected", true);
          if (
            this.TableMapping.filter((x: any) => x.parent === ParentTableName).length >
            0
          ) {
            this.TableMapping.filter((x: any) => x.parent === ParentTableName)[
              this.ZerothIndex
            ]["childs"] = this.ReadAllReferenceTableNames($current);
          }
          this.commonService.ShowToast(
            "Current reference table will create circular reference between other tables."
          );
          ValidFlag = false;
        } else {
          let index = 0;
          while (index < this.TableMapping.length) {
            ParentTableName = this.TableMapping[index].parent;
            if (
              this.TableMapping.filter((x: any) => x.parent === ParentTableName)
                .length > 0
            ) {
              let ReferenceCollection = this.TableMapping.filter(
                (x: any) => x.parent === ParentTableName
              );
              if (ReferenceCollection.length > 0) {
                ReferenceCollection =
                  ReferenceCollection[this.ZerothIndex]["childs"];
                if (ReferenceCollection.indexOf(CurrentSelectedTable) !== -1) {
                  $(e.currentTarget)
                    .find('option[value=""]')
                    .attr("selected", "selected")
                    .prop("selected", true);
                  this.TableMapping.filter((x: any) => x.parent === ParentTableName)[
                    this.ZerothIndex
                  ]["childs"] = this.ReadAllReferenceTableNames($current);
                  this.commonService.ShowToast(
                    "Current reference table will create circular reference between other tables."
                  );
                  ValidFlag = false;
                  break;
                } else {
                  if (ParentTableName === PassedParentName) {
                    this.TableMapping.filter((x: any) => x.parent === ParentTableName)[
                      this.ZerothIndex
                    ]["childs"] = SelectedReferencedTableNames;
                  }
                }
              }
            } else {
              this.TableMapping.push({
                parent: ParentTableName,
                childs: SelectedReferencedTableNames
              });
            }
            index++;
          }
        }
      }
    }
    return ValidFlag;
  }

  FillReferenceColumn(): any {
    let e: any = event;
    let Template = `<option value="{{ColumnName}}">{{ColumnName}}</option>`;
    let FinalTemplate = "";
    let $current: any = e.currentTarget;
    let CurrentSelectedTable = $current.value;
    let ParentTableName = $(e.currentTarget)
      .closest("tr")
      .find('input[name="tablename"]')
      .val();
    let DataType = $($current)
      .closest("tr")
      .find('input[name="column-type"]')
      .val();
    let $elem = $($current)
      .closest("tr")
      .find('select[name="referenceColumnName"]');

    let ReferenceTableCollection = $($current)
      .closest("tbody")
      .find('select[name="referenceTableName"]');
    let IsValid = true;
    if (ReferenceTableCollection.length > 0) {
      if ($elem.length > 0) {
        if (this.TableDetail !== null && this.TableDetail.length > 0) {
          $elem.empty();
          FinalTemplate += '<option value="">Select column</option>';
          let ClonedTemplate = Template;
          let ReferenceColumns = this.TableDetail.filter(
            (x: any) => x.TableName === CurrentSelectedTable
          );
          let Counter = 0;
          if (ReferenceColumns.length > 0) {
            ReferenceColumns = ReferenceColumns[0];
            let index = 0;
            while (index < ReferenceColumns.Data.length) {
              if (
                (ReferenceColumns.Data[index].IsPrimay ||
                  ReferenceColumns.Data[index].IsUnique) &&
                ReferenceColumns.Data[index].DataType === DataType
              ) {
                Counter++;
                FinalTemplate += ClonedTemplate.replace(
                  /{{ColumnName}}/g,
                  ReferenceColumns.Data[index].ColumnName
                );
              }
              index++;
            }
            if (Counter === 0) {
              $(e.currentTarget)
                .find('option[value=""]')
                .attr("selected", "selected")
                .prop("selected", true);
              IsValid = false;
              this.commonService.ShowToast(
                "Check primary / unique key or datatype not matching between tables."
              );
              return null;
            } else {
              $elem.append(FinalTemplate);
            }
          } else {
            $(e.currentTarget)
              .find('option[value=""]')
              .attr("selected", "selected")
              .prop("selected", true);
            IsValid = false;
            this.commonService.ShowToast(
              "No column found for table: " + CurrentSelectedTable
            );
          }
        }
        if (IsValid) {
          this.CheckCircularReference(
            $current,
            ParentTableName,
            CurrentSelectedTable
          );
        }
      }
    }
  }

  GetColumnNames(TblName: string): Array<string> {
    let ColumnNames: Array<any> = [];
    let ColumnSet = this.TableDetail.filter((x: any) => x.TableName === TblName);
    if (ColumnSet.length > 0) {
      ColumnSet = ColumnSet[0].Data;
      ColumnSet = ColumnSet.filter(
        (x: any) => x.IsPrimay === true || x.IsUnique === true
      );
      let index = 0;
      while (index < ColumnSet.length) {
        ColumnNames.push({
          name: ColumnSet[index].ColumnName,
          type: ColumnSet[index].DataType
        });
        index++;
      }
    }
    return ColumnNames;
  }

  PushIntoTableList(IndividualTable: any) {
    let ExistingTable = this.FinalTableDetail.filter(
      x => x.TableName === IndividualTable.TableName
    );
    if (ExistingTable.length === 0) {
      this.FinalTableDetail.push(IndividualTable);
    }
  }

  AddToModifiedList(TableDetail: any, SingleTable: any) {
    let index = 0;
    if (SingleTable["Relation"].length > 0) {
      let RelationTable = null;
      while (index < SingleTable["Relation"].length) {
        RelationTable = TableDetail.filter(
          (x: any) =>
            x.TableName === SingleTable["Relation"][index]["ReferenceTableName"]
        );
        if (RelationTable !== null && RelationTable.length > 0) {
          this.AddToModifiedList(TableDetail, RelationTable[this.ZerothIndex]);
        }
        index++;
      }
      this.PushIntoTableList(SingleTable);
    } else {
      this.PushIntoTableList(SingleTable);
    }
  }

  ReOrganizeTableDetail(TableDetail: any) {
    if (this.commonService.IsValid(TableDetail)) {
      let index = 0;
      let innerIndex = 0;
      while (index < TableDetail.length) {
        if (this.commonService.IsValid(TableDetail[index]["Relation"])) {
          if (TableDetail[index]["Relation"].length > 0) {
            innerIndex = 0;
            while (innerIndex < TableDetail[index]["Relation"].length) {
              this.AddToModifiedList(TableDetail, TableDetail[index]);
              innerIndex++;
            }
            this.PushIntoTableList(TableDetail);
          } else {
            this.PushIntoTableList(TableDetail[index]);
          }
        } else {
          this.PushIntoTableList(TableDetail[index]);
        }
        index++;
      }
    } else {
      console.log("[ReOrganizeTableDetail] method having error.");
      this.commonService.ShowToast("Getting error on reading data.");
    }
  }

  Generate() {
    let Data = this.GetUserInsertedData();
    Data = this.ReadRelationTable(Data);
    this.FinalTableDetail = [];
    this.ReOrganizeTableDetail(Data);
    let Count = $("#rowsCount").val();
    if (!this.EnableGenerateOption) Count = "1";
    if (this.commonService.IsValidString(Count)) {
      try {
        Count = parseInt(Count);
      } catch (e) {
        Count = 0;
      }

      if (Count > 0) {
        if (this.commonService.IsValid(this.FinalTableDetail)) {
          this.ScriptRequestObject = {};
          this.ScriptRequestObject = {
            dynamicTableDetail: this.FinalTableDetail,
            GenerationType: this.SelectedOption,
            Rows: Count
          };
          this.ajax
            .post("GenerateTable", this.ScriptRequestObject)
            .then(result => {
              this.DynamicTableResult = [];
              if (this.commonService.IsValid(result)) {
                let ActualResultSet = result["schemaDataResults"];
                this.ScriptFileName = result["FileName"];
                let index = 0;
                let SingleResult = null;
                let InsertQuery = "";
                let CreateSchema = "";
                let ProcedureSchema = "";
                let IsGrid = false;
                let IsGridJson = false;
                let IsCreateSchema = false;
                let IsProcedureSchema = false;
                let BynamicBindingGridDetail: any = {};
                while (index < ActualResultSet.length) {
                  SingleResult = ActualResultSet[index];
                  if (typeof SingleResult["Table"] !== "undefined") {
                    InsertQuery = JSON.stringify(SingleResult["InsertQuery"]);
                    BynamicBindingGridDetail = this.GenerateDynamicTable(
                      SingleResult["Table"]
                    );
                    if (
                      this.commonService.IsValid(
                        BynamicBindingGridDetail["header"]
                      ) &&
                      this.commonService.IsValid(
                        BynamicBindingGridDetail["body"]
                      )
                    ) {
                      IsGrid = true;
                    } else {
                      BynamicBindingGridDetail = [];
                    }
                    IsGridJson = true;
                  }

                  if (typeof SingleResult["Schema"] !== "undefined") {
                    CreateSchema = SingleResult["Schema"];
                    IsCreateSchema = true;
                  }

                  if (typeof SingleResult["ProcedureSchema"] !== "undefined") {
                    ProcedureSchema = SingleResult["ProcedureSchema"];
                    IsProcedureSchema = true;
                  }

                  this.DynamicTableResult.push({
                    TableCreateSchema: CreateSchema,
                    TableProcedureSchema: ProcedureSchema,
                    GridHeader: BynamicBindingGridDetail["header"],
                    GridData: BynamicBindingGridDetail["body"],
                    GridJsonData: InsertQuery,
                    TableName: SingleResult["TableName"],
                    IsGridRequired: IsGridJson,
                    IsGridJsonRequired: IsGridJson,
                    IsCreateSchemaRequired: IsCreateSchema,
                    IsProcedureSchemaRequired: IsProcedureSchema
                  });
                  index++;
                }
                this.IsResultGenerated = true;
                this.commonService.ShowToast("Result generated successfully");
                // this.commonService.ScrollPageToId("userdefinedtabledetail");
              } else {
                this.commonService.ShowToast("Table creation error");
              }
              //}
            })
            .catch(error => {
              this.commonService.ShowToast("Table creation error");
            });
        }
      } else {
        this.commonService.ShowToast(
          "Please enter no.# value to generate rows."
        );
      }
    }
  }

  ReadRelationTable(TableSchema: Array<any>) {
    let TableRelationData = {};
    let TableRelationCollection = [];
    let TableName = "";
    let ReferencedMappingTable = $("#section-2").find(
      'div[name="relationmappingtable"]'
    );
    let RefTable = "";
    let RefCol = "";
    let Col = "";
    if (
      this.commonService.IsValid(ReferencedMappingTable) &&
      ReferencedMappingTable.length > 0
    ) {
      let tableIndex = 0;
      while (tableIndex < ReferencedMappingTable.length) {
        let RelationFields = $(ReferencedMappingTable[tableIndex]).find(
          'tr[name="tableRelation"]'
        );
        if (
          this.commonService.IsValid(TableSchema) &&
          this.commonService.IsValid(RelationFields)
        ) {
          let index = 0;
          TableName = $(RelationFields[this.ZerothIndex])
            .find('input[name="tablename"]')
            .val();
          while (index < RelationFields.length) {
            RefTable = $(RelationFields[index])
              .find('select[name="referenceTableName"]')
              .val();
            RefCol = $(RelationFields[index])
              .find('select[name="referenceColumnName"]')
              .val();
            Col = $(RelationFields[index])
              .find('select[name="columnName"]')
              .val();
            if (
              this.commonService.IsValidString(RefTable) &&
              this.commonService.IsValidString(RefCol) &&
              this.commonService.IsValidString(Col) &&
              this.commonService.IsValidString(TableName)
            ) {
              TableRelationData = {
                TableName: TableName,
                ColumnName: Col,
                ReferenceTableName: RefTable,
                ReferenceColumnName: RefCol
              };
              TableRelationCollection.push(TableRelationData);
            }
            RefTable = "";
            RefCol = "";
            Col = "";
            TableRelationData = {};
            index++;
          }
        }

        if (TableSchema.filter(x => x.TableName === TableName).length > 0) {
          TableSchema.filter(x => x.TableName === TableName)[this.ZerothIndex][
            "Relation"
          ] = TableRelationCollection;
        }
        TableRelationCollection = [];
        tableIndex++;
      }
    }
    return TableSchema;
  }

  GetUserInsertedData() {
    let $AllTables = $("#section-2").find('tbody[name="table-generater"]');
    let TableWiseData = [];
    if (this.commonService.IsValid($AllTables)) {
      let rowindex = 0;
      while (rowindex < $AllTables.length) {
        let $Table = $($AllTables[rowindex]);
        if (typeof $Table.attr("table-name") !== "undefined") {
          let TableName = $Table.attr("table-name");
          let $Rows = $Table.find('tr[active="1"]');
          let TableValue = [];
          let ColumnName = "";
          let DataType = "";
          let ParsetData = null;
          let Size = "";
          let DefaultValue = "";
          let IsNullable = "";
          let Primary = false;
          let Unique = false;
          let MappedColumn = "";
          let MappedTable = "";
          if ($Rows.length > 0) {
            let index = 0;
            while (index < $Rows.length) {
              ColumnName = "";
              DataType = "";
              Size = "";
              DefaultValue = "";
              IsNullable = "";
              Primary = false;
              Unique = false;

              ColumnName = $($Rows[index])
                .find('input[name="ColumnName"]')
                .val();
              let AutoCompleteData = this.commonService.ReadAutoCompleteObject(
                $($Rows[index]).find('app-iautocomplete[name="DataType"]')
              );

              if (this.commonService.IsValid(AutoCompleteData)) {
                ParsetData = AutoCompleteData["data"];
                DataType = ParsetData["SqlDataType"];
                MappedColumn = ParsetData["ColumnName"];
                MappedTable = ParsetData["TableName"];
              }
              Primary =
                $($Rows[index]).attr("isprimary") === "1" ? true : false;
              Unique = $($Rows[index]).attr("isunique") === "1" ? true : false;
              Size = $($Rows[index])
                .find('input[name="Size"]')
                .val();
              DefaultValue = $($Rows[index])
                .find('input[name="DefaultValue"]')
                .val();
              IsNullable = $($Rows[index])
                .find('input[name="IsNullable"]')
                .prop("checked");
              if (ColumnName != "" && MappedColumn != "") {
                if (MappedColumn === "varchar" || MappedColumn === "nvarchar") {
                  if (Size.trim().length === 0) {
                    $($Rows[index])
                      .find('input[name="Size"]')
                      .addClass("required-field");
                    index++;
                    continue;
                  }
                }
                TableValue.push({
                  ColumnName: ColumnName,
                  DataType: DataType,
                  MappedColumn: MappedColumn,
                  MappedTable: MappedTable,
                  Size: Size,
                  DefaultValue: DefaultValue,
                  IsPrimay: Primary,
                  IsNullable: IsNullable,
                  IsUnique: Unique
                });
              }
              index++;
            }
            TableWiseData.push({
              TableName: TableName,
              Data: TableValue
            });
          }
        }
        rowindex++;
      }
    }
    return TableWiseData;
  }

  GetRow() {
    return {
      ColumnName: [""],
      DataType: [""],
      Size: [""],
      DefaultValue: [""],
      Isnull: [""]
    };
  }

  InitBillingRows(): Array<any> {
    let Row = [];
    let index = 0;
    while (index < 10) {
      Row.push(this.GetRow());
      index++;
    }
    return Row;
  }

  FillInitialRowDetail() {
    let index = 0;
    this.NewTableGenerator = this.InitBillingRows();
    this.DataType.data = this.storage.get("DataType");
  }

  ManageSizeOfTypes(
    value: string,
    isDisabled: boolean,
    placeholder: string,
    $currentEvent: any
  ) {
    if (isDisabled) {
      let currentElem = $currentEvent.closest("tr").find('input[name="Size"]');
      if (currentElem !== null) {
        currentElem.addClass("disabled-filed");
        currentElem.attr("placeholder", placeholder);
        $currentEvent
          .closest("tr")
          .find('input[name="DefaultValue"]')
          .focus();
      }
    } else {
      let currentElem = $currentEvent.closest("tr").find('input[name="Size"]');
      if (currentElem !== null) {
        currentElem.removeClass("disabled-filed");
        currentElem.val(value);
        currentElem.focus();
      }
    }
  }

  HandleAutofillData(e: any) {
    let $e: any = event;
    let Result = JSON.parse(e);
    let $event = $($e.currentTarget);
    if (this.commonService.IsValid(Result)) {
      switch (Result.value) {
        case "varchar":
          this.ManageSizeOfTypes("50", false, "", $event);
          break;
        case "nvarchar":
          this.ManageSizeOfTypes("50", false, "", $event);
          break;
        case "text":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "ntext":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "char":
          this.ManageSizeOfTypes("1", false, "", $event);
          break;
        case "mobile":
          this.ManageSizeOfTypes("14", false, "", $event);
          break;
        case "email":
          this.ManageSizeOfTypes("100", false, "", $event);
          break;
        case "smallint":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "int":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "bigint":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "float":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "decimal":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "date":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "datetime":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "money":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "nchar":
          this.ManageSizeOfTypes("1", false, "", $event);
          break;
        case "real":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "binary":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        case "uniqueidentifier":
          this.ManageSizeOfTypes("", true, "Auto selected", $event);
          break;
        default:
          this.ManageSizeOfTypes("50", false, "", $event);
          break;
      }
    }
  }

  AddNewTable() {
    let AvailableTables = $("#tableNameContainer").find(
      'input[name="dynamic-table-name"]'
    ).length;
    if (this.commonService.IsValidString(AvailableTables)) {
      let NewCount = parseInt(AvailableTables) + 1;
      this.GetTableCount(NewCount);
    }
  }

  GetTableCount(RowCount: number) {
    let tblCount = RowCount; // $("#tablecount").val();
    if (this.commonService.IsValidString(tblCount)) {
      this.requestedtables = [];
      try {
        //tblCount = parseInt(tblCount);
        if (tblCount) {
          this.commonService.ShowLoader();
          let index = 0;
          while (index < tblCount) {
            this.requestedtables.push(index + 1);
            index++;
          }
          setTimeout(() => {
            let $elem: any = document.getElementById("tableNameContainer");
            $elem.scrollIntoView({ behavior: "smooth" });
            this.commonService.HideLoader();
            $("#tableNameContainer")
              .find('input[tabposition="' + (RowCount - 1) + '"]')
              .focus();
          }, 100);
        } else {
          this.commonService.ShowToast("Please enter numeric value only");
        }
      } catch (e) {
        this.commonService.ShowToast(
          "Please enter proper table count. (Integer only)"
        );
      }
    } else {
      this.commonService.ShowToast(
        "Field [ Enter no# of tables ] is mandatory numeric field"
      );
    }
  }

  FindCurrentTag() {
    let e: any = event;
    this.TableNameLabelText = $(e.currentTarget)
      .closest("div")
      .find('span[name="currentTableName"]');
  }

  CheckForTableName() {
    let e: any = event;
    let InputFields = $(e.currentTarget)
      .closest('div[id="dynamic-table-sec"]')
      .find('input[name="dynamic-table-name"]');
    let CurrentName = $(e.currentTarget)
      .val()
      .toLocaleLowerCase();
    if (InputFields.length > 0) {
      this.CheckForDublicate(
        InputFields,
        CurrentName,
        $(e.currentTarget),
        "Table"
      );
    } else {
      this.commonService.ShowToast("Add table first.");
    }
  }

  CheckForDublicateColumnName($event: any) {
    let InputFields = $event.closest("tbody").find('input[name="ColumnName"]');
    let CurrentName = $event.val().toLocaleLowerCase();
    if (this.commonService.IsValidString(CurrentName)) {
      if (InputFields.length > 0) {
        this.CheckForDublicate(InputFields, CurrentName, $event, "Table");
      } else {
        this.commonService.ShowToast("Add table first.");
      }
    }
  }

  CheckForDublicate(
    Fields: any,
    CurrentName: string,
    $event: any,
    Type: string
  ): any {
    let e: any = event;
    if (Fields !== null && Fields.length > 0) {
      let TableNames = [];
      let index = 0;
      while (index < Fields.length) {
        TableNames.push(
          $(Fields[index])
            .val()
            .toLocaleLowerCase()
        );
        index++;
      }

      if (TableNames.filter(x => x === CurrentName).length > 1) {
        this.commonService.ShowToast(
          `${Type} with name [ ${$event.val()} ] is already definded.`
        );
        $event.val("");
        this.commonService.InvalidField($(e.currentTarget));
        return null;
      }
    }
  }

  BindName() {
    let e: any = event;
    this.TableNameLabelText.text($(e.currentTarget).val());
  }
}
