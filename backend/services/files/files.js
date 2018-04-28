const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

const usersFiles = require('../../model/users/usersFiles');

const {
    checkFileSize,
    getFileExtension,
    getFormattedFilename,
    getTempPathFromPath,
} = require('../../commons/utils');
const { FileError, NotAuthorized, NotFound } = require('../../commons/errors');
const { ALLOWED_EXTENSIONS } = require('../../commons/consts/files');
const dates = require('../../commons/dates');

const checkFileOwnership = (accountId, fileId) => usersFiles.getFileById(fileId)
    .then((file) => {
        const { user_id } = file;

        if (Number(user_id) === Number(accountId)) {
            return file;
        }

        throw new NotAuthorized('This is not your file.');
    });

const getPaginatedFilteredFilesByUserId = (accountId, params) => {
    const paramsCount = _.pick(params, ['categories', 'name', 'isPublic']);

    const countPromise = usersFiles.getPaginatedFilteredFilesCount(accountId, paramsCount);
    const resultPromise = usersFiles.getPaginatedFilteredFiles(accountId, params);

    return Promise.all([resultPromise, countPromise]);
};

const getFilesByUserId = accountId => usersFiles.getFilesByUserId(accountId)
    .then(files => files
        .map(file => Object.assign(file, { created: dates.readDate(file.created) }))
    )
    .catch((err) => {
        if (err instanceof NotFound) {
            return [];
        }

        throw err;
    });

const getCategories = accountId => usersFiles.getCategories(accountId)
    .then(categories => _.uniq(categories.map(cat => cat.category)))
    .catch((err) => {
        if (err instanceof NotFound) {
            return [];
        }

        throw err;
    });

const getOneFile = (accountId, fileId) => checkFileOwnership(accountId, fileId);

const uploadFile = (req, res, next) => {
    const userId = req.user.id;
    const uploadDirectory = path.join(__dirname, `../../upload`);
    const targetDirectory = path.join(__dirname, `../../upload/${userId}`);

    // create the upload directory
    if (!fs.existsSync(uploadDirectory)){
        fs.mkdirSync(uploadDirectory);
    }

    // create directory by user
    if (!fs.existsSync(targetDirectory)){
        fs.mkdirSync(targetDirectory);
    }

    let errorHasBeenThrown = false;
    let errorMessage;
    const form = new formidable.IncomingForm();

    form.multiples = true;
    form.uploadDir = targetDirectory;
    form.keepExtensions = true;
    form.maxFileSize = 51 * 1048576; // max file size: 50 Megabytes

    function handleFile(field, file) {
        const extension = getFileExtension(file.name);

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            fs.unlink(file.path, (error) => {});
            errorHasBeenThrown = true;
            errorMessage = 'Incorrect file type.';
        }
        else if (!checkFileSize(req.user, file.size)) {
            fs.unlink(file.path, (error) => {});
            errorHasBeenThrown = true;
            errorMessage = 'File too big.';
        }
        else {
            const tempPath = getTempPathFromPath(file.path);
            usersFiles.addFile(userId, file.size, file.type, tempPath)
                .then((fileId) => {
                    const filePath = getFormattedFilename(userId, fileId, file.name);
                    const newPath = path.join(__dirname, `../..${filePath}`);

                    fs.rename(file.path, newPath, function (err) {
                        if (err) {
                            errorHasBeenThrown = true;
                            errorMessage = 'File renaming failed.';
                            fs.unlink(file.path);
                            usersFiles.hardDeleteFile(fileId);
                        } else {
                            usersFiles.updateUrl(fileId, filePath);
                        }
                    });
                });
        }
    }

    form.on('file', handleFile);

    form.on('error', function(err) {
        next(err);
    });

    form.on('end', function() {
        usersFiles.fixIncorrectFileUrl()
            .catch((err) => {
                if (!(err instanceof NotFound)) {
                    next(err);
                }
            });

        if (!errorHasBeenThrown) {
            res.sendStatus(200);
        } else {
            next(new FileError(errorMessage));
        }
    });

    form.parse(req);
};

const deleteFile = (accountId, fileId) => checkFileOwnership(accountId, fileId)
    .then((file) => {
        const { url } = file;

        const fullUrl = path.join(__dirname, `../..${url}`);

        return fs.unlink(fullUrl, (err) => {
            // if file does not exist, no need to delete it
            // if (err) {
            //     throw new FileError(`Unable to delete file.`);
            // }

            return usersFiles.hardDeleteFile(fileId);
        });
    });

const updateName = (accountId, fileId, name) => checkFileOwnership(accountId, fileId)
    .then((file) => usersFiles.updateName(fileId, name));

const updateCategory = (accountId, fileId, category) => checkFileOwnership(accountId, fileId)
    .then((file) => usersFiles.updateCategory(fileId, category));

const updateIsPublic = (accountId, fileId, isPublic) => checkFileOwnership(accountId, fileId)
    .then((file) => usersFiles.updateIsPublic(fileId, isPublic));

module.exports = {
    deleteFile,
    getCategories,
    getPaginatedFilteredFilesByUserId,
    getFilesByUserId,
    getOneFile,
    updateCategory,
    updateIsPublic,
    updateName,
    uploadFile,
};
