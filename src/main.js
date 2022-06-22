const {app, BrowserWindow} = require('electron');


let createWindow

const mainWindow = () => {
    createWindow = new BrowserWindow({
        width: 640,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        }  
    });

    createWindow.loadFile('src/index.html')
}


app.whenReady().then(() =>{
    mainWindow()
})
