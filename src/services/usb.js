import dfu from 'services/dfu';

const MD380_VENDOR_ID = 0x0483,
      MD380_PRODUCT_ID = 0xdf11;

module.exports = {

    requestMD380: () => {
        return navigator.usb
            .requestDevice({
                filters: [{
                    vendorId: MD380_VENDOR_ID,
                    productId: MD380_PRODUCT_ID
                }]
            });
    },

    requestAvailableMD380: () => {
        return navigator.usb
            .getDevices();
    },

    reboot: async (device) => {
        let dfuInterface = dfu.findDeviceDfuInterfaces(device)
            .filter(intfc => intfc.alternate.alternateSetting === 0)
            .reduceRight((a,b) => a || b);
        let dfuInstance = new dfu(device, dfuInterface);

        try {
            await dfuInstance.open();
            await dfuInstance.md380Custom(0x91, 0x05);
            await dfuInstance.getStatus();
        } catch (e) {
            console.error(e);
        }
    },

    // Get codeplug from radio
    downloadCodeplug: async (device, progressCallback) => {
        let dfuInterface = dfu.findDeviceDfuInterfaces(device)
            .filter(intfc => intfc.alternate.alternateSetting === 0)
            .reduceRight((a,b) => a || b);
        let dfuInstance = new dfu(device, dfuInterface, progressCallback);

        try {
            await dfuInstance.open();
            await dfuInstance.md380Custom(0x91, 0x01);
            await dfuInstance.getStatus();
            await dfuInstance.md380Custom(0xa2, 0x02);
            await dfuInstance.getStatus();
            await dfuInstance.md380Custom(0xa2, 0x02);
            await dfuInstance.getStatus();
            await dfuInstance.md380Custom(0xa2, 0x03);
            await dfuInstance.getStatus();
            await dfuInstance.md380Custom(0xa2, 0x04);
            await dfuInstance.getStatus();
            await dfuInstance.md380Custom(0xa2, 0x07);
            await dfuInstance.getStatus();

            let result = await dfuInstance.setAddress(0x00000000);
            if (!result) {
                console.log('[USB] could not set proper address. abort!');
                throw 'error setting address';
            }

            // block_size = 1024
            // offset = 0x02
            // end = 0x102
            await dfuInstance.getStatus();
            await dfuInstance.abortToIdle();
            let data = await dfuInstance.do_upload(1024, 1024 * 0x102, 2);
            // TODO works up to this point
            // TODO 3- diff MD380tools vs mytool
            // TODO 4- on disconnect event should emit action
            return data;

        } catch(e) {
            console.error('[DFU] bailing on error, status:', await dfuInstance.getStatus(), 'error', e);
            throw e;
        }

    },

    // Upload codeplug to radio
    uploadCodeplug: (device, codeplug) => {
        // TODO
    }

};

