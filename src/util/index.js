const getDatabaseId = (url) => {
    let urlObj = new URL(url);
    let urlPath = urlObj.pathname;
    let dbId = urlPath.substring(urlPath.lastIndexOf('/') + 1);
    return dbId;
}

const getPageId = (url) => {
    //98847cd9c7604c71bda483ba6979fd0d
    const urlPath = (new URL(url)).pathname
    const rId = urlPath.substring(urlPath.lastIndexOf('/') + 1)
    return [
        rId.substring(0, 8),
        rId.substring(8, 12),
        rId.substring(12, 16),
        rId.substring(16, 20),
        rId.substring(20, 32)
    ].join('-')
}

const getBlockId = (url) => {
    return url.substring(url.lastIndexOf('#')+1 , url.length);
}

module.exports = {
    getDatabaseId,
    getPageId,
    getBlockId
}