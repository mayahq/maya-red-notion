const getDatabaseId = (url) => {
    let len = "https://www.notion.so/".length;
    let index2 = url.indexOf('/',len);
    index2 = index2 <=0 ? url.length : index2;
    let index3 = url.indexOf('?v=',index2);
    index3 = index3 <=0 ? url.length : index3;
    return url.substring(index2+1, index3);
}

const getPageId = (url) => {
    let indexOfDash = url.lastIndexOf('-');
    let indexOfHash = url.lastIndexOf('#');
    let len = indexOfHash > indexOfDash ? indexOfHash : url.length;
    return url.substring(indexOfDash+1 , indexOfHash );
}

const getBlockId = (url) => {
    return url.substring(url.lastIndexOf('#')+1 , url.length);
}

module.exports = {
    getDatabaseId,
    getPageId,
    getBlockId
}