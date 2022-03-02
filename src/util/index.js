const getDatabaseId = (url) => {
    let len = "https://www.notion.so/".length;
    let index2 = url.indexOf('/',len);
    index2 = index2 <=0 ? url.length : index2;
    let index3 = url.indexOf('?v=',index2);
    index3 = index3 <=0 ? url.length : index3;
    return url.substring(index2+1, index3);
}

module.exports = {
    getDatabaseId
}