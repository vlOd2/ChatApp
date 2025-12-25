/* eslint-disable */

if (!document.documentMode) {
    document.body.innerHTML = "";
    alert("This application must be run in Internet Explorer");
    window.close();
}

if (document.documentMode < 11) {
    document.body.innerHTML = "";
    alert("This application requires Internet Explorer 11");
    window.close();
}
