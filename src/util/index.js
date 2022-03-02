const getDatabaseId = (url) => {
    let len = "https://www.notion.so/".length;
    let index2 = url.indexOf('/',len);
    index2 = index2 <=0 ? url.length : index2;
    let index3 = url.indexOf('?v=',index2);
    index3 = index3 <=0 ? url.length : index3;
    return url.substring(index2+1, index3);
}

const getPageId = (url) => {
    let indexOfDash = str.lastIndexOf('-');
    let indexOfHash = str.lastIndexOf('#');
    let len = indexOfHash > indexOfDash ? indexOfHash : str.length;
    return url.substring(indexOfDash+1 , indexOfHash );
}

const getBlockId = (url) => {
    return url.substring(str.lastIndexOf('#')+1 , str.length);
}

module.exports = {
    getDatabaseId,
    getPageId,
    getBlockId
}