var charmStyle = {
    "idiv": `
        position: fixed;
        bottom: 20px;
        left: 0;
        height: 80px;
        width: 45px;
        overflow: hidden;
        z-index: 9999; !important`,
    "email-iframe-container": `
        background: white;
        width: 0;
        height: 0;
        border-radius: 10px 10px 0 0;`,
    "email-sender": `
        background-color: white;
        background: #2e3b40;
        margin: 0;
        width: 100%;
        height: 30px;
        visibility: visible`,
    "hidden": `
        visibility: hidden;
    `,
    "email-iframe-container-visible": `
        -webkit-transition: height 300ms ease-in-out;
        transition: height 300ms ease-in-out;
        background: white;
        width: 30%;
        min-width: 300px;
        height: 300px;
        position: fixed;
        left: 0;
        bottom: 65px;`
}