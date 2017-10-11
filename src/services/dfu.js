async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class Dfu {

    constructor(device, settings, progressCallback) {
        this.DETACH = 0x00;
        this.DNLOAD = 0x01;
        this.UPLOAD = 0x02;
        this.GETSTATUS = 0x03;
        this.CLRSTATUS = 0x04;
        this.GETSTATE = 0x05;
        this.ABORT = 0x06;

        this.appIDLE = 0;
        this.appDETACH = 1;
        this.dfuIDLE = 2;
        this.dfuDNLOAD_SYNC = 3;
        this.dfuDNBUSY = 4;
        this.dfuDNLOAD_IDLE = 5;
        this.dfuMANIFEST_SYNC = 6;
        this.dfuMANIFEST = 7;
        this.dfuMANIFEST_WAIT_RESET = 8;
        this.dfuUPLOAD_IDLE = 9;
        this.dfuERROR = 10;

        this.STATUS_OK = 0x0;

        this.device = device;
        this.settings = settings;
        this.intfNumber = settings["interface"].interfaceNumber;
        // progressCallback(device, progressBytes, totalBytes)
        this.progressCallback = progressCallback || function() {};
    }

    static findDeviceDfuInterfaces(device) {
        let interfaces = [];
        for (let conf of device.configurations) {
            for (let intf of conf.interfaces) {
                for (let alt of intf.alternates) {
                    if (alt.interfaceClass == 0xFE &&
                        alt.interfaceSubclass == 0x01 &&
                        (alt.interfaceProtocol == 0x01 || alt.interfaceProtocol == 0x02)) {
                        let settings = {
                            "configuration": conf,
                            "interface": intf,
                            "alternate": alt,
                            "name": alt.interfaceName
                        };
                        interfaces.push(settings);
                    }
                }
            }
        }

        return interfaces;
    }

    static findAllDfuInterfaces() {
        return navigator.usb.getDevices().then(
            devices => {
                let matches = [];
                for (let device of devices) {
                    let interfaces = this.findDeviceDfuInterfaces(device);
                    for (let interface_ of interfaces) {
                        matches.push(new Dfu(device, interface_));
                    }
                }
                return matches;
            }
        );
    };

    logDebug(msg) {}
    logInfo(msg) { console.log('[DFU] [INFO] ' + msg); }
    logWarning(msg) { console.log('[DFU] [WARN] ' + msg); }
    logError(msg) { console.error('[DFU] [ERROR] ' + msg); }
    logProgress(done, total) {
        if (total) {
            console.log(`[DFU] progress is ${total}/${done}`);
        } else {
            console.log(`[DFU] progress is ${done}`);
        }
    }

    async open() {
        console.log("[DFU] device open");
        await this.device.open();
        const confValue = this.settings.configuration.configurationValue;
        if (this.device.configuration === null ||
            this.device.configuration.configurationValue != confValue) {
            await this.device.selectConfiguration(confValue);
        }

        const intfNumber = this.settings["interface"].interfaceNumber;
        if (!this.device.configuration.interfaces[intfNumber].claimed) {
            await this.device.claimInterface(intfNumber);
        }

        const altSetting = this.settings.alternate.alternateSetting;
        let intf = this.device.configuration.interfaces[intfNumber];
        if (intf.alternate === null ||
            intf.alternate.alternateSetting != altSetting) {
            await this.device.selectAlternateInterface(intfNumber, altSetting);
        }
    }

    async close() {
        try {
            await this.device.close();
        } catch (error) {
            console.log(error);
        }
    }

    readDeviceDescriptor() {
        const GET_DESCRIPTOR = 0x06;
        const DT_DEVICE = 0x01;
        const wValue = (DT_DEVICE << 8);

        return this.device.controlTransferIn({
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": 0
        }, 18).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result.status);
                }
            }
        );
    }

    async readStringDescriptor(index, langID) {
        if (typeof langID === 'undefined') {
            langID = 0;
        }

        const GET_DESCRIPTOR = 0x06;
        const DT_STRING = 0x03;
        const wValue = (DT_STRING << 8) | index;

        const request_setup = {
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": langID
        };

        // Read enough for bLength
        var result = await this.device.controlTransferIn(request_setup, 1);

        if (result.status == "ok") {
            // Retrieve the full descriptor
            const bLength = result.data.getUint8(0);
            result = await this.device.controlTransferIn(request_setup, bLength);
            if (result.status == "ok") {
                const len = (bLength-2) / 2;
                let u16_words = [];
                for (let i=0; i < len; i++) {
                    u16_words.push(result.data.getUint16(2+i*2, true));
                }

                if (langID == 0) {
                    // Return the langID array
                    return u16_words;
                } else {
                    // Decode from UCS-2 into a string
                    return String.fromCharCode.apply(String, u16_words);
                }
            }
        }
        throw `Failed to read string descriptor ${index}: ${result.status}`;
    }

    async readInterfaceNames() {
        const DT_INTERFACE = 4;

        let configs = {};
        let allStringIndices = new Set();
        for (let configIndex=0; configIndex < this.device.configurations.length; configIndex++) {
            const rawConfig = await this.readConfigurationDescriptor(configIndex);
            let configDesc = this.parseConfigurationDescriptor(rawConfig);
            let configValue = configDesc.bConfigurationValue;
            configs[configValue] = {};

            // Retrieve string indices for interface names
            for (let desc of configDesc.descriptors) {
                if (desc.bDescriptorType == DT_INTERFACE) {
                    if (!(desc.bInterfaceNumber in configs[configValue])) {
                        configs[configValue][desc.bInterfaceNumber] = {};
                    }
                    configs[configValue][desc.bInterfaceNumber][desc.bAlternateSetting] = desc.iInterface;
                    if (desc.iInterface > 0) {
                        allStringIndices.add(desc.iInterface);
                    }
                }
            }
        }

        let strings = {};
        // Retrieve interface name strings
        for (let index of allStringIndices) {
            try {
                strings[index] = await this.readStringDescriptor(index, 0x0409);
            } catch (error) {
                console.log(error);
                strings[index] = null;
            }
        }

        for (let configValue in configs) {
            for (let intfNumber in configs[configValue]) {
                for (let alt in configs[configValue][intfNumber]) {
                    const iIndex = configs[configValue][intfNumber][alt];
                    configs[configValue][intfNumber][alt] = strings[iIndex];
                }
            }
        }

        return configs;
    }

    parseDeviceDescriptor(data) {
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            bcdUSB:             data.getUint16(2, true),
            bDeviceClass:       data.getUint8(4),
            bDeviceSubClass:    data.getUint8(5),
            bDeviceProtocol:    data.getUint8(6),
            bMaxPacketSize:     data.getUint8(7),
            idVendor:           data.getUint16(8, true),
            idProduct:          data.getUint16(10, true),
            bcdDevice:          data.getUint16(12, true),
            iManufacturer:      data.getUint8(14),
            iProduct:           data.getUint8(15),
            iSerialNumber:      data.getUint8(16),
            bNumConfigurations: data.getUint8(17)
        };
    }

    parseConfigurationDescriptor(data) {
        let descriptorData = new DataView(data.buffer.slice(9));
        let descriptors = this.parseSubDescriptors(descriptorData);
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            wTotalLength:       data.getUint16(2, true),
            bNumInterfaces:     data.getUint8(4),
            bConfigurationValue:data.getUint8(5),
            iConfiguration:     data.getUint8(6),
            bmAttributes:       data.getUint8(7),
            bMaxPower:          data.getUint8(8),
            descriptors:        descriptors
        };
    }

    parseInterfaceDescriptor(data) {
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            bInterfaceNumber:   data.getUint8(2),
            bAlternateSetting:  data.getUint8(3),
            bNumEndpoints:      data.getUint8(4),
            bInterfaceClass:    data.getUint8(5),
            bInterfaceSubClass: data.getUint8(6),
            bInterfaceProtocol: data.getUint8(7),
            iInterface:         data.getUint8(8),
            descriptors:        []
        };
    }

    parseFunctionalDescriptor(data) {
        return {
            bLength:           data.getUint8(0),
            bDescriptorType:   data.getUint8(1),
            bmAttributes:      data.getUint8(2),
            wDetachTimeOut:    data.getUint16(3, true),
            wTransferSize:     data.getUint16(5, true),
            bcdDFUVersion:     data.getUint16(7, true)
        };
    }

    parseSubDescriptors(descriptorData) {
        const DT_INTERFACE = 4;
        const DT_ENDPOINT = 5;
        const DT_DFU_FUNCTIONAL = 0x21;
        const USB_CLASS_APP_SPECIFIC = 0xFE;
        const USB_SUBCLASS_DFU = 0x01;
        let remainingData = descriptorData;
        let descriptors = [];
        let currIntf;
        let inDfuIntf = false;
        while (remainingData.byteLength > 2) {
            let bLength = remainingData.getUint8(0);
            let bDescriptorType = remainingData.getUint8(1);
            let descData = new DataView(remainingData.buffer.slice(0, bLength));
            if (bDescriptorType == DT_INTERFACE) {
                currIntf = this.parseInterfaceDescriptor(descData);
                if (currIntf.bInterfaceClass == USB_CLASS_APP_SPECIFIC &&
                    currIntf.bInterfaceSubClass == USB_SUBCLASS_DFU) {
                    inDfuIntf = true;
                } else {
                    inDfuIntf = false;
                }
                descriptors.push(currIntf);
            } else if (inDfuIntf && bDescriptorType == DT_DFU_FUNCTIONAL) {
                let funcDesc = this.parseFunctionalDescriptor(descData);
                descriptors.push(funcDesc);
                currIntf.descriptors.push(funcDesc);
            } else {
                let desc = {
                    bLength: bLength,
                    bDescriptorType: bDescriptorType,
                    data: descData
                };
                descriptors.push(desc);
                if (currIntf) {
                    currIntf.descriptors.push(desc);
                }
            }
            remainingData = new DataView(remainingData.buffer.slice(bLength));
        }

        return descriptors;
    }

    readConfigurationDescriptor(index) {
        const GET_DESCRIPTOR = 0x06;
        const DT_CONFIGURATION = 0x02;
        const wValue = ((DT_CONFIGURATION << 8) | index);

        return this.device_.controlTransferIn({
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": 0
        }, 4).then(
            result => {
                if (result.status == "ok") {
                    // Read out length of the configuration descriptor
                    let wLength = result.data.getUint16(2, true);
                    return this.device.controlTransferIn({
                        "requestType": "standard",
                        "recipient": "device",
                        "request": GET_DESCRIPTOR,
                        "value": wValue,
                        "index": 0
                    }, wLength);
                } else {
                    return Promise.reject(result.status);
                }
            }
        ).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result.status);
                }
            }
        );
    }

    async md380Custom(a, b) {
        console.log(`[DFU] MD380 custom 0x${a.toString(16)}, 0x${b.toString(16)}`);
        a &= 0xFF;
        b &= 0xFF;
        const len = 2;
        let buffer = new ArrayBuffer(len),
            view = new DataView(buffer);
        view.setUint8(0, a);
        view.setUint8(1, b);
        let result = await this.requestOut(this.DNLOAD, buffer, 0);
        await this.getStatus();
        await timeout(100);
        return result;
    }

    async setAddress(address) {
        console.log(`[DFU] setAddress -> 0x${address.toString(16)}`);
        address &= 0xFFFFFFFF;
        const len = 5;
        let buffer = new ArrayBuffer(len),
            view = new DataView(buffer);
        view.setUint8(0, 0x21);
        view.setUint32(1, address);

        let result = await this.requestOut(this.DNLOAD, buffer, 0);
        await this.getStatus();
        let status = await this.getStatus();

        if (status.state === this.dfuDNLOAD_IDLE) {
            console.log(`[DFU] address pointer set to 0x${address.toString(16)}`);
            return true;
        } else {
            console.error('[DFU] failed to set address');
            return false;
        }
    }

    async requestOut(bRequest, data, wValue=0) {
        return this.device.controlTransferOut({
            "requestType": "class",
            "recipient": "interface",
            "request": bRequest,
            "value": wValue,
            "index": this.intfNumber
        }, data).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.bytesWritten);
                } else {
                    return Promise.reject(result.status);
                }
            },
            error => {
                return Promise.reject("ControlTransferOut failed: " + error);
            }
        );
    }

    requestIn(bRequest, wLength, wValue=0) {
        return this.device.controlTransferIn({
            "requestType": "class",
            "recipient": "interface",
            "request": bRequest,
            "value": wValue,
            "index": this.intfNumber
        }, wLength).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result.status);
                }
            },
            error => {
                return Promise.reject("ControlTransferIn failed: " + error);
            }
        );
    }

    detach() {
        return this.requestOut(this.DETACH, undefined, 1000);
    }

    async waitDisconnected(timeout) {
        let device = this;
        let usbDevice = this.device;
        return new Promise(function(resolve, reject) {
            let timeoutID;
            if (timeout > 0) {
                function onTimeout() {
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    if (device.disconnected !== true) {
                        reject("Disconnect timeout expired");
                    }
                }
                timeoutID = setTimeout(reject, timeout);
            }

            function onDisconnect(event) {
                if (event.device === usbDevice) {
                    if (timeout > 0) {
                        clearTimeout(timeoutID);
                    }
                    device.disconnected = true;
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    event.stopPropagation();
                    resolve(device);
                }
            }

            navigator.usb.addEventListener("disconnect", onDisconnect);
        });
    }

    download(data, blockNum) {
        return this.requestOut(this.DNLOAD, data, blockNum);
    }

    upload(length, blockNum) {
        console.log(`[DFU] upload -> length: 0x${length.toString(16)}, blockNum: 0x${blockNum.toString(16)}`);
        return this.requestIn(this.UPLOAD, length, blockNum);
    }

    clearStatus() {
        return this.requestOut (this.CLRSTATUS);
    }

    async getStatus() {
        console.log('[DFU] get status');
        return this.requestIn(this.GETSTATUS, 6).then(
            data =>
                Promise.resolve({
                    "status": data.getUint8(0),
                    "pollTimeout": data.getUint32(1, true) & 0xFFFFFF,
                    "state": data.getUint8(4)
                }),
            error =>
                Promise.reject("DFU GETSTATUS failed: " + error)
        );
    }

    getState() {
        return this.requestIn(this.GETSTATE, 1).then(
            data => Promise.resolve(data.getUint8(0)),
            error => Promise.reject("DFU GETSTATE failed: " + error)
        );
    }

    abort() {
        return this.requestOut(this.ABORT);
    }

    async abortToIdle() {
        console.log('[DFU] Abort status to IDLE');
        await this.abort();
        let state = await this.getState();
        if (state == this.dfuERROR) {
            await this.clearStatus();
            state = await this.getState();
        }
        if (state != this.dfuIDLE) {
            throw "Failed to return to idle state after abort: state " + state.state;
        }
    }

    async do_upload(xfer_size, max_size=Infinity, first_block=0) {
        let transaction = first_block;
        let blocks = [];
        let bytes_read = 0;

        this.logInfo("Copying data from DFU device to browser");
        // Initialize progress to 0
        this.logProgress(0);
        this.progressCallback(this.device, 0);

        let result;
        let bytes_to_read;
        do {
            bytes_to_read = Math.min(xfer_size, max_size - bytes_read);
            result = await this.upload(bytes_to_read, transaction++);
            await this.getStatus();
            this.logDebug("Read " + result.byteLength + " bytes");
            if (result.byteLength > 0) {
                blocks.push(result);
                bytes_read += result.byteLength;
            }
            if (Number.isFinite(max_size)) {
                this.logProgress(bytes_read, max_size);
                this.progressCallback(this.device, bytes_read, max_size);
            } else {
                this.logProgress(bytes_read);
                this.progressCallback(this.device, bytes_read);
            }
        } while ((bytes_read < max_size) && (result.byteLength == bytes_to_read));

        if (bytes_read == max_size) {
            await this.abortToIdle();
        }

        this.logInfo(`Read ${bytes_read} bytes`);

        return new Blob(blocks, { type: "application/octet-stream" });
    }

    async poll_until(state_predicate) {
        let dfu_status = await this.getStatus();

        let device = this;
        function async_sleep(duration_ms) {
            return new Promise(function(resolve, reject) {
                device.logDebug("Sleeping for " + duration_ms + "ms");
                setTimeout(resolve, duration_ms);
            });
        }

        while (!state_predicate(dfu_status.state) && dfu_status.state != this.dfuERROR) {
            await async_sleep(dfu_status.pollTimeout);
            dfu_status = await this.getStatus();
        }

        return dfu_status;
    }

    async poll_until(state_predicate) {
        let dfu_status = await this.getStatus();

        let device = this;
        function async_sleep(duration_ms) {
            return new Promise(function(resolve, reject) {
                device.logDebug("Sleeping for " + duration_ms + "ms");
                setTimeout(resolve, duration_ms);
            });
        }

        while (!state_predicate(dfu_status.state) && dfu_status.state != this.dfuERROR) {
            await async_sleep(dfu_status.pollTimeout);
            dfu_status = await this.getStatus();
        }

        return dfu_status;
    }

    poll_until_idle(idle_state) {
        return this.poll_until(state => (state == idle_state));
    }

    async do_download(xfer_size, data, manifestationTolerant) {
        let bytes_sent = 0;
        let expected_size = data.byteLength;
        let transaction = 0;

        this.logInfo("Copying data from browser to DFU device");

        // Initialize progress to 0
        this.logProgress(bytes_sent, expected_size);

        while (bytes_sent < expected_size) {
            const bytes_left = expected_size - bytes_sent;
            const chunk_size = Math.min(bytes_left, xfer_size);

            let bytes_written = 0;
            let dfu_status;
            try {
                bytes_written = await this.download(data.slice(bytes_sent, bytes_sent+chunk_size), transaction++);
                this.logDebug("Sent " + bytes_written + " bytes");
                dfu_status = await this.poll_until_idle(this.dfuDNLOAD_IDLE);
            } catch (error) {
                throw "Error during DFU download: " + error;
            }

            if (dfu_status.status != this.STATUS_OK) {
                throw `DFU DOWNLOAD failed state=${dfu_status.state}, status=${dfu_status.status}`;
            }

            this.logDebug("Wrote " + bytes_written + " bytes");
            bytes_sent += bytes_written;

            this.logProgress(bytes_sent, expected_size);
        }

        this.logDebug("Sending empty block");
        try {
            await this.download(new ArrayBuffer([]), transaction++);
        } catch (error) {
            throw "Error during final DFU download: " + error;
        }

        this.logInfo("Wrote " + bytes_sent + " bytes");
        this.logInfo("Manifesting new firmware");

        if (manifestationTolerant) {
            // Transition to MANIFEST_SYNC state
            let dfu_status;
            try {
                dfu_status = await this.poll_until_idle(this.dfu_IDLE);
            } catch (error) {
                if (error.endsWith("ControlTransferIn failed: NotFoundError: Device unavailable.")) {
                    this.logWarning("Unable to poll final manifestation status");
                } else {
                    throw "Error during DFU manifest: " + error;
                }
            }

            if (dfu_status.status != this.STATUS_OK) {
                throw `DFU MANIFEST failed state=${dfu_status.state}, status=${dfu_status.status}`;
            }
        } else {
            // Try polling once to initiate manifestation
            try {
                let final_status = await this.getStatus();
                this.logDebug(`Final DFU status: state=${final_status.state}, status=${final_status.status}`);
            } catch (error) {
                this.logDebug("Manifest GET_STATUS poll error: " + error);
            }

            // Reset to exit MANIFEST_WAIT_RESET
            try {
                await this.device_.reset();
            } catch (error) {
                if (error == "NetworkError: Unable to reset the device." ||
                    error == "NotFoundError: Device unavailable.") {
                    this.logDebug("Ignored reset error");
                } else {
                    throw "Error during reset for manifestation: " + error;
                }
            }
        }

        return;
    }
}
