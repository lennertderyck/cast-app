// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path');
const find = require('find');
const fs = require('fs');
const {node, eventCallback, getFormData, Element} = require('cutleryjs/dist/js/legacy.min.js');
const {sesamCollapse, sesam} = require('sesam-collapse/dist/legacy.min.js')
const ChromecastAPI = require('chromecast-api');
const client = new ChromecastAPI();

window.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    client.on('device', (device) => {
        devices.load(device);
    })
})

const app = {
    init() {
        app.listeners();
        
        sesamCollapse.initialize();
    },
    
    listeners() {
        document.addEventListener('change', (event) => {
            eventCallback('[data-form="addFiles"]', (target) => {
                const formData = getFormData(target);
                files.add(formData.get('file'));
            }, false)
            
            eventCallback('[data-form="selectDevice"]', (target) => {
                const formData = getFormData(target);
                devices.set(formData.get('device'));
            }, false)
        })
    }
}

const devices = {
    init() {
        devices.render();
    },
    
    play() {
        const selectedDevice = devices.getSelected();
        
        var mediaURL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
       
        selectedDevice.play(mediaURL, (err) => {
          if (!err) console.log('Playing in your chromecast')
          if (err) console.log(err);
        })
    },
    
    set(name) {
        console.log(name);
        const selectedDevice = devicesList[name]
        console.log(selectedDevice);
        window.localStorage.setItem('castDefaultDevice', JSON.stringify(selectedDevice));
    },
    
    load(device) {
        devices.render(device)
        devicesList[device.name] = device;
    },
    
    render(device) {
        const option = new Element('option');
        option.return().value = device.name;
        option.inner(device.friendlyName);
        option.append('[data-section="devicesList"] form > select');
    },
    
    getSelected() {
        const target = node('[data-form="selectDevice"]')
        const formData = getFormData(target);
        const name = formData.get('device');
        
        return devicesList[name];
    }
}, devicesList = {};

const files = {
    add(file) {
        const dir = path.dirname(file.path);
        file.dir = dir
        files.findThumb(dir);
        filesList.add(file);
        files.checkExisting();
        
        console.log(filesList);
        
        devices.play();
    },
    
    async findThumb(dirname) {
        // find.file(/\.png|.jpeg|.jpg$/, dirname, (files) => {
        //     console.log(files[0]);
        // })
        
        let dirCont = fs.readdirSync( dirname );
        let files = dirCont.filter(( elm ) => {return elm.match(/\.png|.jpeg|.jpg$/)});
        return files[0];
    },
    
    checkExisting() {
        const amount = filesList.size;
        
        if (amount >= 1) {
            sesam({
                target: 'addFiles',
                action: 'hide'
            })
        }
    },
    
    renderList() {
        filesList.forEach(item => {
            const listItem = new Element('li');
            
        })
    }
}, filesList = new Set();