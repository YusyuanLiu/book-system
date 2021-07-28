var bookDataFromLocalStorage = [];

$(function(){
    loadBookData();

    /*Kendo Window*/
    
    function initWindow() {
        var windowOptions = {
            actions: ["Minimize", "Maximize", "Close"],
            modal: true,
            width: "500px",
            title: "新增書籍",
            visible: false,
            draggable: false
        };
        
        $("#window").kendoWindow(windowOptions);
        $("#window").data("kendoWindow").center();

        $("#add").click(function () {
            $("#window").data("kendoWindow").open();
        });
    }

    initWindow();

    /*Kendo Validator*/
    var validator = $("#window").kendoValidator().data("kendoValidator");

    /*新增書籍*/
    $("#book_add").click(function() {
        
        if (validator.validate()) {
            var maxBookID=0;

            for(var i = 0; i < bookDataFromLocalStorage.length; i++) {
                if(bookDataFromLocalStorage[i].BookId > maxBookID) {
                    maxBookID = bookDataFromLocalStorage[i].BookId;
                }
            }
            var insertBookData = {
                "BookId": maxBookID+1, //長度要直接去搜到最大值
                "BookCategory": $("#book_category").data("kendoDropDownList").text(),
                "BookName": $("#book_name").val(),
                "BookAuthor": $("#book_author").val(),
                "BookBoughtDate": kendo.toString($("#bought_datepicker").data("kendoDatePicker").value(), "yyyy-MM-dd")
            }
            $("#book_grid").data("kendoGrid").dataSource.add(insertBookData);
            bookDataFromLocalStorage.push(insertBookData);
            localStorage.setItem("bookData",JSON.stringify(bookDataFromLocalStorage));
            alert("新增書籍成功");
            $("#book_name").val("");
            $("#book_author").val("");
            $("#window").data("kendoWindow").close();
        } else {
            alert("新增書籍失敗");
        }
    });

    var data = [
        {text:"資料庫",value:"database"},
        {text:"網際網路",value:"internet"},
        {text:"應用系統整合",value:"system"},
        {text:"家庭保健",value:"home"},
        {text:"語言",value:"language"}
    ]
    $("#book_category").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: data,
        index: 0,
        change: onChange
    });
    
    /*Kendo Datepicker*/
    $("#bought_datepicker").kendoDatePicker({
        format: "yyyy-MM-dd",
        dateInput: true,
        max: new Date(),
        value: new Date()
    });

    $("#book_grid").kendoGrid({
        dataSource: {
            data: bookDataFromLocalStorage,
            schema: {
                model: {
                    fields: {
                        BookId: {type:"int"},
                        BookName: { type: "string" },
                        BookCategory: { type: "string" },
                        BookAuthor: { type: "string" },
                        BookBoughtDate: { type: "string" }
                    }
                }
            },
            pageSize: 20,
        },
        toolbar: kendo.template("<div class='book-grid-toolbar'><input id='book_search' class='book-grid-search' placeholder='我想要找......' type='text'></input></div>"),
        //filterable: true,
        height: 550,
        sortable: true,
        pageable: {
            input: true,
            numeric: false
        },
        columns: [
            { field: "BookId", title: "書籍編號",width:"10%"},
            { field: "BookName", title: "書籍名稱", width: "50%" },
            { field: "BookCategory", title: "書籍種類", width: "10%" },
            { field: "BookAuthor", title: "作者", width: "15%" },
            { field: "BookBoughtDate", title: "購買日期", width: "15%" },
            { command: { text: "刪除", click: deleteBook }, title: " ", width: "120px" }
        ]
        
    });

    /*搜尋書籍*/
    $("#book_search").on("input", function(){
        var val = $("#book_search").val();
        
        $("#book_grid").data("kendoGrid").dataSource.filter({
            logic: "or",
            filters: [
                {
                    field: "BookName",
                    operator: "contains",
                    value: val
                },
                {
                    field: "BookAuthor",
                    operator: "contains",
                    value: val
                },
                {
                    field: "BookCategory",
                    operator: "contains",
                    value: val
                }
            ]
        });
    });

})

function loadBookData(){
    bookDataFromLocalStorage = JSON.parse(localStorage.getItem("bookData"));
    if(bookDataFromLocalStorage == null){
        bookDataFromLocalStorage = bookData;
        localStorage.setItem("bookData",JSON.stringify(bookDataFromLocalStorage));
    }
    //bookDataFromLocalStorage = bookData;
    //localStorage.setItem("bookData",JSON.stringify(bookDataFromLocalStorage));
}

/*更換類別圖片*/
function onChange(){
    var img = $("#book_category").data("kendoDropDownList").value();
    
    $("#book_img").attr("src", "image/"+img+".jpg");
}

/*刪除書籍*/
/**
 *
 *
 * @param {*} e
 */
function deleteBook(e){
    var grid = $("#book_grid").data("kendoGrid");
    var deleteBook = $(e.target).closest("tr");
    var bookID = grid.dataItem(deleteBook).BookId;
    
    if(confirm("確定要刪除嗎")) {
        grid.removeRow(deleteBook);

        for(var i = 0; i < bookDataFromLocalStorage.length; i++) {
            if(bookDataFromLocalStorage[i].BookId == bookID) {
                bookDataFromLocalStorage.splice(i, 1);
                break;
            }
        }
        localStorage.setItem("bookData",JSON.stringify(bookDataFromLocalStorage));
    }
}