'use strict';

const htmlToText = require('html-to-text');

function prepareComments(title, $body, options) {

    // prepare the comments
    var textBlock = title + '\n\n';

    textBlock += 'Shipping info: \n\n:';

    textBlock += htmlToText.fromString($body('body').find('#shippingInformation').html(), {
        wordwrap: 130,
        ignoreImage: true,
        ignoreHref: true
    });

    textBlock += "\n\n";

    if ($body('body').find('#comment').html()) {
        textBlock += 'Other comments: \n\n';
        textBlock += htmlToText.fromString($body('body').find('#comment').html(), {
            wordwrap: 130,
            ignoreImage: true,
            ignoreHref: true
        });
    }

    return textBlock;
}

module.exports = prepareComments;