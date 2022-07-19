const getDatabaseId = (url) => {
    let urlObj = new URL(url);
    let urlPath = urlObj.pathname;
    let dbId = urlPath.substring(urlPath.lastIndexOf('/') + 1);
    return dbId;
}

const getPageId = (url) => {
    let indexOfDash = url.lastIndexOf('-');
    let indexOfHash = url.lastIndexOf('#');
    let len = indexOfHash > indexOfDash ? indexOfHash : url.length;
    return url.substring(indexOfDash+1 , len );
}

const getBlockId = (url) => {
    return url.substring(url.lastIndexOf('#')+1 , url.length);
}

module.exports = {
    getDatabaseId,
    getPageId,
    getBlockId
}