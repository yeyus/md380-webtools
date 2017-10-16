import React from 'react';

function padHex(value) {
    let str = value.toString(16),
        pad = "00000000";
    return pad.substring(0, pad.length - str.length) + str;
}

async function blobToArrayBuffer(blob) {
	  var fileReader = new FileReader();

	  return new Promise(function(resolve, reject) {
		    fileReader.onloadend = resolve;
		    fileReader.onerror = reject;

		    fileReader.readAsArrayBuffer(blob);
	  });
};

export default class HexLine extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null
        };
    }

    async componentDidMount() {
        let ab = await blobToArrayBuffer(this.props.data);
        let view = new DataView(ab.target.result);
        this.setState({
            data: view
        });
    }

    getHexContentString() {
        let { data } = this.state,
            { size } = this.props.size,
            bytes = [];

        if (!data) {
            return bytes;
        }

        for (let i = 0; i < this.props.size; i++) {
            try {
                bytes.push(data.getUint8(i).toString(16));
            } catch (e) {
                bytes.push('--')
            }
        }

        return bytes.join(' ');
    }

    getAsciiContentString() {
        let { data } = this.state,
            { size } = this.props.size,
            letters = [];

        if (!data) {
            return letters;
        }

        for (let i = 0; i < this.props.size; i++) {
            try {
                letters.push(String.fromCharCode(data.getUint8(i)));
            } catch(e) {
                letters.push('.')
            }
        }

        return letters.join('');
    }

    render() {
        let offset = padHex(this.props.offset);
        let size = this.props.size;
        let hexContents = this.getHexContentString(),
            asciiContents = this.getAsciiContentString();

        return (
            <li>
                <code>{offset} {hexContents} {asciiContents} </code>
            </li>
        );
    }
}
