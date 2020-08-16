// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path');
const fs = require('fs');
const {node, eventCallback, getFormData, Element} = require('cutleryjs/dist/js/legacy.min.js');
const {sesamCollapse, sesam} = require('sesam-collapse/dist/legacy.min.js')
const ChromecastAPI = require('chromecast-api');
const client = new ChromecastAPI();
const movieInfo = require('movie-info');

const browserSync = require("browser-sync");

browserSync({  
    port: 9001,
    server: '/',
    open: false,
    ui: {
        port: 8080
    },
    callbacks: {
        ready: (err, bs) => {
            console.log(bs);
        }
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    window.appSettings = {};
    
    app.init();
    
    await client.on('device', (device) => {
        devices.load(device);
    })
})

client.on('device', function (device) {
    var mediaURL = 'file://Users/lennertderyck/Movies/een berichtje voor de welpies.mp4';
  
    device.play(mediaURL, function (err) {
      if (!err) console.log('Playing in your chromecast')
    })
  })

const app = {
    init() {
        app.listeners();
        network.init();
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
        // devices.displayList();
    },
    
    play(url = window.appSettings.loadedFile.path) {
        console.log(url);
        const backupUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
        const selectedDevice = devices.getSelected();
        
        selectedDevice.play(url, (err) => {
          if (!err) console.log('Playing in your chromecast')
          if (err) console.log(err);
        })
    },
    
    getFileFromList() {
    
    },
    
    setPlaying() {
        // edit playing node by json data
    },
    
    set(name) {       
        const selectedDevice = devicesList.get(name);
        console.log('selected', devices.getSelected());
        window.localStorage.setItem('castDefaultDevice', JSON.stringify(selectedDevice));
    },
    
    unset() {      
        devicesList.forEach(device => {
            const node = device.node.return().querySelector('input')
            node.removeAttribute('checked')
        })
    },
    
    load(device) {
        device.node = devices.render(device);
        device.node.append('[data-form="selectDevice"] .selector');
        devicesList.set(device.name, device);
    },
    
    render(device) {
        const option = new Element('div');
        option.class(['input-group'])
        option.inner(`
            <input type="radio" name="device" id="selectDevice_device_${device.name}" value="${device.name}" checked>
            <label for="selectDevice_device_${device.name}" class="mr-2"><i class="uil uil-desktop uil__md"></i> ${device.friendlyName}</label>
        `);
        return option;
        // option.append('[data-form="selectDevice"] .selector');
    },
    
    getSelected() {
        const target = node('[data-form="selectDevice"]')
        const formData = getFormData(target);
        const name = formData.get('device');
        
        return devicesList.get(name);
    }
}, devicesList = new Map();

const files = {
    async add(file) {
        const dir = path.dirname(file.path);
        const thumb = await files.findThumb(dir);
        
        file.dir = dir
        file.thumb = `${dir}/${thumb}`
        file.node = files.render(file);
        
        files.setToPlay(file);
        filesList.set(file.path, file);
        files.checkExisting(); // hide fileuploader if one or more files are added
    },
    
    setToPlay(file) {
        const $fileToPlay = file.node.return();
        const $fileToStop = node('[data-section="filesList"] .list .state__playing')
        
        if ($fileToStop) $fileToStop.setAttribute('data-state', 'notplaying');
        $fileToPlay.setAttribute('data-state', 'playing');
        window.appSettings.loadedFile = file;
        
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
    
    checkFiletype(filetype ,callback = null, error = null) {
        console.log(filetype);
        
        const type = {
            'video/mp4': true,
            'audio/mp4': true,
        }[filetype]
        console.log('type', type)
        
        callback()
    },
    
    render(file) {
        const item = new Element('div');
        item.class(['list__item', 'item']);
        item.attributes([
            ['data-file', file.path]
        ])
        item.inner(`
            <div class="item__thumb">
                <i class="uil uil-clapper-board"></i>
            </div>
            <div class="item__details">
                <span>${file.name}</span>
            </div>
        `)
        item.append('[data-section="filesList"] .list')
        return item;
    },
    
    renderList() {
        filesList.forEach(item => {
            const listItem = new Element('li');
            
        })
    }
}, filesList = new Map();

const network = {
    init() {
        network.render();
        network.constantTesting();
    },
    
    getSpeed() {
        const online = window.navigator.onLine;
        const speed =  online ? navigator.connection.effectiveType : online;
        return {
            false: 0,
            'slow-2g': 1,
            '2g': 1,
            '3g': 2,
            '4g': 3,
        }[speed];
    },
    
    constantTesting() {
        console.log('constantTesting');
        
        navigator.connection.addEventListener('change', (event) => {
            const speed = network.getSpeed(event.target.effectiveType);
            network.render(speed);
        });
    },
    
    render(speed = network.getSpeed()) {
        const text = {
            0: 'offline',
            1: 'slow',
            2: 'good',
            3: 'strong'
        }[speed]
        const $networkSpeed = node('[data-label="networkSpeed"]');
        const $networkSpeedText = node('[data-label="networkSpeed"] span')
        $networkSpeed.setAttribute('data-networkspeed', text);
        $networkSpeedText.innerHTML = text;
    }
}