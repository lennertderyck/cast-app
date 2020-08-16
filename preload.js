// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path');
const find = require('find');
const fs = require('fs');
const {node, eventCallback, getFormData, Element} = require('cutleryjs/dist/js/legacy.min.js');
const {sesamCollapse, sesam} = require('sesam-collapse/dist/legacy.min.js')
const ChromecastAPI = require('chromecast-api');
const client = new ChromecastAPI();
const movieInfo = require('movie-info');

window.addEventListener('DOMContentLoaded', async () => {
    app.init();
    
    await client.on('device', (device) => {
        devices.load(device);
    })
    console.log('loaded')
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
        // devices.displayList();
    },
    
    play() {
        const selectedDevice = devices.getSelected();
        
        var mediaURL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
       
        selectedDevice.play(mediaURL, (err) => {
          if (!err) console.log('Playing in your chromecast')
          if (err) console.log(err);
        })
    },
    
    setPlaying() {
        // edit json data and dom element
        // save dom element in json
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
        console.log(file);
        
        const dir = path.dirname(file.path);
        const thumb = await files.findThumb(dir);
        
        file.dir = dir
        file.thumb = `${dir}/${thumb}`
        file.node = files.render(file);
        
        filesList.set(file.path, file);
        files.checkExisting(); // hide fileuploader if one or more files are added
        
        // devices.play();
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