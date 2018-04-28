import axios from 'axios';

function getCategories() {
    return axios.get('/api/back/files/categories');
}

function loadFiles(offset, quantity, categories, name, isPublic) {
    const params = {
        offset,
        quantity,
        categories: categories.map(cat => encodeURIComponent(cat)),
        name: encodeURIComponent(name),
        isPublic,
    };
    return axios.get('api/back/files', { params });
}

function loadOneFile(fileId) {
    return axios.get(`api/back/files/${fileId}`);
}

function sendFiles(files) {
    const formData = new FormData();;
    const options = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    };

    files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
    });

    return axios.post('api/back/files/upload', formData, options);
}

function deleteFile(fileId) {
    return axios.delete(`api/back/files/${fileId}`);
}

function updateFileName(fileId, name) {
    const body = { name: name.trim() };
    return axios.patch(`api/back/files/${fileId}/name`, body);
}

function updateFileCategory(fileId, category) {
    const body = { category: category.trim() };
    return axios.patch(`api/back/files/${fileId}/category`, body);
}

function updateFileIsPublic(fileId, isPublic) {
    const body = { isPublic };
    return axios.patch(`api/back/files/${fileId}/public`, body);
}

export {
    deleteFile,
    getCategories,
    loadFiles,
    loadOneFile,
    sendFiles,
    updateFileCategory,
    updateFileIsPublic,
    updateFileName,
};
