import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
declare var $:any;
import { CommonService } from "./../../providers/common-service/common.service";

@Component({
  selector: "app-iautocomplete",
  templateUrl: "./iautocomplete.component.html",
  styleUrls: ["./iautocomplete.component.scss"]
})
export class IautocompleteComponent implements OnInit {
  SampleData: any;
  BindingData: any = [];
  AutofillDroopdownHeight: any;
  HeightValue: number;
  AutofillObject: any;
  InitValue: string = "";
  InitData: string = "";

  OriginalData: any = null;
  DropdownData: any = null;
  placeholder: string = "";
  currentValue: any = "";
  selectedIndex: number = -1;
  element: any;
  el: any;
  suggestions = [];
  badQueries = [];
  intervalId: any;
  cachedResponse = [];
  onChange: any;
  onChangeInterval: any;
  isLocal: any;
  ignoreValueChange: any;
  suggestionsContainer: any = null;
  options: any;
  classes: any;
  isShowEmptyRow: boolean = false;
  $CurrentAutoComplete: any;
  manualFocus: boolean = false;
  DefaultValue: any = null;
  IsSingleMode: boolean = false;
  @Input() filterByServer: any;
  @Input() ClassName: any;
  @Input() Tabindex: any;
  @Output() OnSelect = new EventEmitter();
  @Output() onKeyup = new EventEmitter();
  @Output() onFocus = new EventEmitter();
  @Input()
  set SingleMode(mode: string) {
    if (typeof mode !== "undefined") {
      if (mode === "on") {
        this.IsSingleMode = true;
      } else {
        this.IsSingleMode = false;
      }
    }
  }

  @Input()
  set Data(UpdatedData: any) {
    if (typeof UpdatedData !== "undefined") {
      this.DropdownData = UpdatedData;
      this.OriginalData = UpdatedData;
      this.ManageBindingData();
    }
  }

  get Data() {
    return this.OriginalData;
  }

  @Input()
  set Defaultvalue(InitialValue: any) {
    if (typeof InitialValue !== "undefined") {
      this.DefaultValue = InitialValue;
      this.BindDefaultValue();
    }
  }

  constructor(private commonService: CommonService) {
    this.HeightValue = 250;
    this.AutofillDroopdownHeight = this.HeightValue.toString() + "px";
  }

  BindDefaultValue() {
    if (this.DefaultValue !== null) {
      let elems = this.DropdownData.data.filter(
        (x: any) => x.value === this.DefaultValue.value
      );
      if (elems.length === 1) {
        this.InitValue = elems[0].value;
        this.InitData = JSON.stringify(elems[0].data);
      } else if (elems.length > 1) {
      }
    }
  }

  NoAction() {
    let $event: any = event;
    $event.stopPropagation();
    $event.preventDefault();
  }

  ManageBindingData() {
    if (this.commonService.IsValid(this.DropdownData)) {
      this.BindingData = null;
      this.BindingData = this.DropdownData.data;
      this.placeholder = this.DropdownData.placeholder;
      if (this.$CurrentAutoComplete !== null) {
        this.suggestions = this.commonService.IsValid(this.DropdownData.data)
          ? this.DropdownData.data
          : [];
      }

      if (
        typeof this.BindingData !== "undefined" &&
        this.BindingData !== null
      ) {
        if (this.BindingData.length === 0) this.isShowEmptyRow = true;
        else this.isShowEmptyRow = false;
      } else {
        this.isShowEmptyRow = true;
      }
    }
  }

  ngOnInit() {}

  InitialSetup(a: any, b: any) {
    var c = function() {},
      cn = {
        autoSelectFirst: !1,
        appendTo: "iautofill-searchfield",
        serviceUrl: null,
        lookup: null,
        onValueSelect: null,
        width: "auto",
        minChars: 1,
        maxHeight: 200,
        deferRequestBy: 0,
        params: {},
        //formatResult: g.formatResult,
        delimiter: null,
        zIndex: 9999,
        type: "GET",
        noCache: !1,
        onSearchStart: c,
        onSearchComplete: c,
        containerClass: "autocomplete-suggestions",
        tabDisabled: !1,
        dataType: "text",
        lookupFilter: function(a: any, b: any, c: any) {
          return -1 !== a.value.toLowerCase().indexOf(c);
        },
        paramName: "query",
        transformResult: function(a: any) {
          return "string" === typeof a ? $.parseJSON(a) : a;
        }
      };
    this.element = a;
    this.el = $(a);
    this.suggestions = this.commonService.IsValid(b.lookup) ? b.lookup : [];
    this.badQueries = [];
    this.selectedIndex = -1;
    this.currentValue = this.element.value;
    this.intervalId = 0;
    this.cachedResponse = [];
    this.onChange = this.onChangeInterval = null;
    this.isLocal = this.ignoreValueChange = !1;
    this.suggestionsContainer = $(a)
      .closest('div[name="autofill-container"]')
      .find('div[name="iautofill-div"]')[0];
    this.options = $.extend({}, cn, b);
    this.classes = {
      selected: "autocomplete-selected",
      suggestion: "autocomplete-suggestion"
    };
    this.setOptions(b);
    setTimeout(() => {
      this.moveOnTab();
    }, 100);
  }

  InitAutoComplete() {
    $("#autocomplete").autocomplete({
      lookup: this.BindingData,
      onValueSelect: function(suggestion: any) {
        var thehtml =
          "<strong>Currency Name:</strong> " +
          suggestion.value +
          " <br> <strong>Symbol:</strong> " +
          suggestion.data;
        $("#outputcontent").html(thehtml);
      }
    });
  }

  ShowAutofillDropdown() {
    this.onFocus.emit();
    let $e: any = event;
    if (!this.manualFocus) {
      this.ManageBindingData();
      let $event = $($e.currentTarget).closest(
        'div[name="autofill-container"]'
      );
      $event.find('input[name="autocomplete"]').val("");
      $event.find('div[name="suggestionBox-dv"]').removeClass("d-none");
      this.manualFocus = true;
      $event.find('input[name="autocomplete"]').focus();
      this.$CurrentAutoComplete = $event;
      this.InitialSetup($event.find('input[name="autocomplete"]')[0], {
        lookup: this.BindingData,
        onValueSelect: null
      });
    } else {
      this.manualFocus = false;
    }
  }

  onKeyPress(a: any) {
    let $event: any = event;
    switch (a.keyCode) {
      case 27:
        this.el.val(this.currentValue);
        this.hide();
        break;
      case 9:
        if (-1 === this.selectedIndex) {
          let fulltext = $($event.currentTarget).val();
          this.selectOption({ value: fulltext, data: "" });
          this.hide();
          return;
        }
        this.select(this.selectedIndex, true);
        break;
      case 13:
        if (-1 === this.selectedIndex) {
          let fulltext = $($event.currentTarget).val();
          this.selectOption({ value: fulltext, data: "" });
          this.hide();
          return;
        }
        this.select(this.selectedIndex, 13 === a.keyCode);
        if (9 === a.keyCode && !1 === this.options.tabDisabled) return;
        break;
      case 38:
        this.moveUp();
        break;
      case 40:
        this.moveDown();
        break;
      default:
        return;
    }
    a.stopImmediatePropagation();
    a.preventDefault();
  }

  onKeyUp(a: any) {
    var b = this;
    switch (a.keyCode) {
      case 38:
      case 40:
        return;
    }
    clearInterval(b.onChangeInterval);
    if (b.currentValue !== b.el.val())
      if (0 < b.options.deferRequestBy)
        b.onChangeInterval = setInterval(function() {
          b.onValueChange();
        }, b.options.deferRequestBy);
      else {
        if (this.filterByServer) {
          this.currentValue = this.element.value;
          a = this.getQuery(this.currentValue);
          this.onKeyup.emit(a);
        } else b.onValueChange();
      }
  }

  onValueChange() {
    var a;
    clearInterval(this.onChangeInterval);
    this.currentValue = this.element.value;
    a = this.getQuery(this.currentValue);
    this.selectedIndex = -1;
    this.ignoreValueChange
      ? (this.ignoreValueChange = !1)
      : a.length < this.options.minChars
      ? (this.BindingData = this.DropdownData.data)
      : this.getSuggestions(a);
  }

  getSuggestions(a: any) {
    // make ajax request;
    let Data = this.DropdownData.data;
    this.BindingData = [];
    let index = 0;
    while (index < Data.length) {
      if (
        Data[index].value !== null &&
        Data[index].value.toLocaleLowerCase().indexOf(a) === 0
      ) {
        this.BindingData.push(Data[index]);
      }
      index++;
    }
  }

  getQuery(a: any) {
    var b = this.options.delimiter;
    if (!b) return $.trim(a);
    a = a.split(b);
    return $.trim(a[a.length - 1]);
  }

  getSuggestionsLocal(a: any) {
    var b = a.toLowerCase(),
      c = this.options.lookupFilter;
    return {
      suggestions: $.grep(this.options.lookup, function(d: any) {
        return c(d, a, b);
      })
    };
  }

  hide() {
    this.selectedIndex = -1;
    //$(this.suggestionsContainer).hide();
    this.$CurrentAutoComplete.find('input[name="autocomplete"]').val("");
    this.$CurrentAutoComplete
      .find('div[name="suggestionBox-dv"]')
      .addClass("d-none");
  }

  activate(a: any) {
    var b = this.classes.selected,
      c = $(this.suggestionsContainer),
      d = c.children();
    c.children("." + b).removeClass(b);
    this.selectedIndex = a;
    return -1 !== this.selectedIndex && d.length > this.selectedIndex
      ? ((a = d.get(this.selectedIndex)), $(a).addClass(b), a)
      : null;
  }

  select(a: any, b: any) {
    var c = this.BindingData[a];
    c &&
      (this.el.val(c),
      (this.ignoreValueChange = b),
      this.hide(),
      this.onValueSelect(a));
    this.selectOption(c);
  }

  selectOption(c: any) {
    this.$CurrentAutoComplete
      .find('input[name="iautofill-textfield"]')
      .val(c.value);
    this.$CurrentAutoComplete
      .find('input[name="iautofill-textfield"]')
      .attr("data", JSON.stringify(c.data));
    this.$CurrentAutoComplete
      .find('div[name="suggestionBox-dv"]')
      .addClass("d-none");

    let TableRowIndex = "";
    let $e: any = event;
    let $event: any = $e.currentTarget;
    if ($event.closest("tr") !== null) {
      TableRowIndex = $event.closest("tr").getAttribute("index");
      if (
        TableRowIndex === undefined ||
        TableRowIndex === null ||
        TableRowIndex === ""
      )
        TableRowIndex = "0";
    }
    this.OnSelect.emit(
      JSON.stringify({
        value: c.value,
        data: c.data,
        index: TableRowIndex
      })
    );

    if (this.IsSingleMode) {
      let index = 0;
      while (index < this.BindingData.length) {
        if (this.BindingData[index].data.uid === c.data.uid) {
          this.BindingData.splice(index, 1);
        }
        index++;
      }
      this.ToggleRemoveIcon(JSON.stringify(c), false);
    }
  }

  AddToAutoFillList() {
    let $event: any = event;
    this.$CurrentAutoComplete = $($event.currentTarget).closest("div");
    this.ToggleRemoveIcon($($event.currentTarget).attr("data"), true);
    this.ClearSelection();
  }

  ToggleRemoveIcon(JsonData: string, IsAddtoList: boolean) {
    let $item = this.$CurrentAutoComplete.find('a[name="remove-pointer"]');
    $item.toggleClass("d-none");
    $item.attr("data", JsonData);
    if (IsAddtoList) {
      let Item = JSON.parse(JsonData);
      this.BindingData.unshift(Item);
    }
  }

  ClearSelection() {
    let elem = this.$CurrentAutoComplete.find(
      'input[name="iautofill-textfield"]'
    );
    if (elem !== null) {
      elem.val("");
      elem.attr("data", "");
      this.InitData = "";
    }
  }

  moveUp() {
    -1 !== this.selectedIndex &&
      (0 === this.selectedIndex
        ? ($(this.suggestionsContainer)
            .children()
            .first()
            .removeClass(this.classes.selected),
          (this.selectedIndex = -1),
          this.el.val(this.currentValue))
        : this.adjustScroll(this.selectedIndex - 1));
  }

  moveDown() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.adjustScroll(this.selectedIndex + 1);
  }

  moveOnTab() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.EnableFieldOnTab(this.selectedIndex + 1);
  }

  EnableFieldOnTab(a: any) {
    var b = this.activate(a);
  }

  adjustScroll(a: any) {
    var b = this.activate(a),
      c,
      d;
    b &&
      ((b = b.offsetTop),
      (c = $(this.suggestionsContainer).scrollTop()),
      (d = c + this.options.maxHeight - 25),
      b < c
        ? $(this.suggestionsContainer).scrollTop(b)
        : b > d &&
          $(this.suggestionsContainer).scrollTop(
            b - this.options.maxHeight + 32
          ),
      this.el.val(this.getValue(this.BindingData[a].value)));
  }

  onValueSelect(a: any) {
    var b = this.options.onValueSelect;
    a = this.BindingData[a];
    this.el.val(this.getValue(a.value));
    $.isFunction(b) && b.call(this.element, a);
  }

  getValue(a: any) {
    var b = this.options.delimiter,
      c;
    if (!b) return a;
    c = this.currentValue;
    b = c.split(b);
    return 1 === b.length
      ? a
      : c.substr(0, c.length - b[b.length - 1].length) + a;
  }

  dispose() {
    this.el.off(".autocomplete").removeData("autocomplete");
    this.disableKillerFn();
    $(this.suggestionsContainer).remove();
  }

  onBlur() {
    this.hide();
    this.killSuggestions();
  }

  setOptions(a: any) {
    var b = this.options;
    var h = {
      extend: function(a: any, b: any) {
        return $.extend(a, b);
      },
      createNode: function(a: any) {
        var b = document.createElement("div");
        b.innerHTML = a;
        return b.firstChild;
      }
    };
    h.extend(b, a);
    if ((this.isLocal = $.isArray(b.lookup)))
      b.lookup = this.verifySuggestionsFormat(b.lookup);
    $(this.suggestionsContainer).css({
      "max-height": b.maxHeight + "px",
      width: b.width + "px",
      "z-index": b.zIndex
    });
  }

  verifySuggestionsFormat(a: any) {
    return a.length && "string" === typeof a[0]
      ? $.map(a, function(a: any) {
          return {
            value: a,
            data: null
          };
        })
      : a;
  }

  clearCache() {
    this.cachedResponse = [];
    this.badQueries = [];
  }

  clear() {
    this.clearCache();
    this.currentValue = null;
    this.suggestions = [];
  }

  fixPosition() {
    let a: any;
    "body" === this.options.appendTo &&
      ((a = this.el.offset()),
      $(this.suggestionsContainer).css({
        top: a.top + this.el.outerHeight() + "px",
        left: a.left + "px"
      }));
  }

  enableKillerFn() {
    $(document).on("click.autocomplete", this.killerFn);
  }

  disableKillerFn() {
    $(document).off("click.autocomplete", this.killerFn);
  }

  killerFn(b: any) {
    0 === $(b.target).closest("." + this.options.containerClass).length &&
      (this.killSuggestions(), this.disableKillerFn());
  }

  killSuggestions() {
    let a: any = this;
    a.stopKillSuggestions();
    a.intervalId = window.setInterval(function() {
      a.hide();
      a.stopKillSuggestions();
    }, 300);
  }

  stopKillSuggestions() {
    window.clearInterval(this.intervalId);
  }
}
