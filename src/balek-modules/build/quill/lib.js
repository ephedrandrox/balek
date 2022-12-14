import Quill from 'quill/core';

import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';

//formats
//inline
import {ColorStyle } from 'quill/formats/color';
import {BackgroundStyle} from 'quill/formats/background';
import {FontStyle} from 'quill/formats/font';
//import {SizeStyle} from 'quill/formats/size';

import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Strike from 'quill/formats/strike';
import CodeBlock from "quill/formats/code";
import {Code} from "quill/formats/code";


//blocks
import Header from 'quill/formats/header';
import Underline from 'quill/formats/underline';
import List from 'quill/formats/list';
import {ListItem} from 'quill/formats/list';
import Blockquote from "quill/formats/blockquote";
import {AlignStyle} from "quill/formats/align";
import {IndentClass} from "quill/formats/indent";


import Image from 'quill/formats/image';


Quill.register({
    'modules/toolbar': Toolbar,
    'themes/snow': Snow,

    //formats
    //inline
    'formats/color': ColorStyle,
    'formats/background': BackgroundStyle,
    'formats/font': FontStyle,
    // 'formats/size': SizeStyle,
    'formats/bold': Bold,
    'formats/italic': Italic,
    'formats/strike': Strike,
    'formats/code': Code,

    //block
    'formats/header': Header,
    'formats/underline': Underline,
    'formats/list': List,
    'formats/blockquote': Blockquote,
    'formats/align': AlignStyle,
    'formats/indent': IndentClass,

    //embeds
    'formats/image':Image,

});


let Inline = Quill.import('blots/inline');

let Delta = Quill.import('delta');


class LinkBlot extends Inline {
    static create(value) {
        let node = super.create();
        // Sanitize url value if desired
        node.setAttribute('href', value);
        // Okay to set other non-format related attributes
        // These are invisible to Parchment so must be static
        node.setAttribute('target', '_blank');
        return node;
    }

    static formats(node) {
        // We will only be called with a node already
        // determined to be a Link blot, so we do
        // not need to check ourselves
        return node.getAttribute('href');
    }
}
LinkBlot.blotName = 'link';
LinkBlot.tagName = 'a';

Quill.register(LinkBlot);
Quill.register(ListItem);
Quill.register(CodeBlock);


//Video - got from quill guide

let BlockEmbed = Quill.import('blots/block/embed');


class VideoBlot extends BlockEmbed {
    static create(url) {
        let node = super.create();
        node.setAttribute('src', url);
        // Set non-format related attributes with static values
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', true);

        return node;
    }

    static formats(node) {
        // We still need to report unregistered embed formats
        let format = {};
        if (node.hasAttribute('height')) {
            format.height = node.getAttribute('height');
        }
        if (node.hasAttribute('width')) {
            format.width = node.getAttribute('width');
        }
        return format;
    }

    static value(node) {
        return node.getAttribute('src');
    }

    format(name, value) {
        // Handle unregistered embed formats
        if (name === 'height' || name === 'width') {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name, value);
            }
        } else {
            super.format(name, value);
        }
    }
}
VideoBlot.blotName = 'video';
VideoBlot.tagName = 'iframe';

Quill.register(VideoBlot);

export default {Quill, Delta};