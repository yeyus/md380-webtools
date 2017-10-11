let dfu = require('lib/dfu');

window.onload = () => {
    console.log('Hi there from usb.js, dfu', dfu);

    let btnRequest = document.getElementById('requestDevice');


    btnRequest.addEventListener('click', ev => {
        navigator.usb
            .requestDevice({ filters: [{ vendorId: 0x0483, productId: 0xdf11 }]})
            .then(device => {
                console.log(`Product Name: ${device.productName}`);
                console.log(`Manufacturer Name: ${device.manufacturerName}`);
            })
            .catch(error => {
                // There was a canceled request?
                console.error(error);
            });
    });

    md380_codeplug_download = (device) => {
        md380_custom(device, 0x91, 0x01);
        md380_custom(device, 0xa2, 0x02);
        md380_custom(device, 0xa2, 0x02);
        md380_custom(device, 0xa2, 0x03);
        md380_custom(device, 0xa2, 0x04);
        md380_custom(device, 0xa2, 0x07);
    };

    md380_custom = (device, a, b) => {
        a &= 0xFF;
        b &= 0xFF;
        let buffer = new ArrayBuffer(2),
            data = new Uint8Array(buffer);
        data[0] = a;
        data[1] = b;

        // refer to bmRequestType deconding in USB specification
        return device.controlTransferOut({
            requestType: 'class', // 0x21
            recipient: 'interface',
            request: Request.DNLOAD,
            value: 0x00,
            index: 0x00
        }, data);
    };
};
