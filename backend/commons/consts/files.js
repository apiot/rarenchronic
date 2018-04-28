const { GROUPS_SET } = require('./groups');

const ALLOWED_IMAGE_FORMATS = [
    'jpg',
    'jpeg',
    'png',
    'gif',
];

const ALLOWED_FILE_FORMATS = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'pps',
    'ppsx',
    'txt',
    'md',
];

const ALLOWED_EXTENSIONS = [
    ...ALLOWED_IMAGE_FORMATS,
    ...ALLOWED_FILE_FORMATS,
];

const IMAGE_MIMES = [
    'image/jpeg', // jpg jpeg
    'image/png', // png
    'image/gif', // gif
    'image/tiff', // tif tiff
    'application/postscript', // eps
];

const FILE_MIMES = [
    'application/pdf', // pdf
    'application/msword', // doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel', // xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-powerpoint', // ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'application/vnd.ms-powerpoint', // pps
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow', // ppsx
    'text/richtext', // rtf
    'application/vnd.oasis.opendocument.presentation', // odp
    'application/vnd.oasis.opendocument.spreadsheet', // ods
    'application/vnd.oasis.opendocument.text', // odt
];

const ALLOWED_MIMES = [
    ...IMAGE_MIMES,
    ...FILE_MIMES,
];

const MAX_FILE_SIZE = { // in Megabyte
    [GROUPS_SET.USERS]: 5,
    [GROUPS_SET.FOUNDATORS]: 50,
    [GROUPS_SET.ADMINISTRATORS]: 20,
    [GROUPS_SET.MODERATORS]: 10,
    [GROUPS_SET.PHYSICIANS]: 20,
};

module.exports = {
    ALLOWED_IMAGE_FORMATS,
    ALLOWED_FILE_FORMATS,
    ALLOWED_EXTENSIONS,
    IMAGE_MIMES,
    FILE_MIMES,
    ALLOWED_MIMES,
    MAX_FILE_SIZE,
};
