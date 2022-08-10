/**
 * 
 * @param {any} data 
 * @returns {boolean}
 */
function validateTableTypeData(data) {
    if (typeof data !== 'object') {
        return false
    }

    const values = Object.values(data)
    for (let i = 0; i < values.length; i++) {
        const val = values[i]
        if (!val.type || !val.value) {
            return false
        }
    }

    return true
}

/**
 * 
 * @param {import('./types').TableValue} val 
 */
function getNotionPropertyValue(val) {
    switch (val.type.toLowerCase()) {
        case 'title': {
            if (typeof val.value === 'string') {
                return {
                    title: [{
                        type: 'text',
                        text: { content: val.value }
                    }]
                }
            } 
            return {
                title: val.value
            }
        }

        case 'rich_text': {
            if (typeof val.value === 'string') {
                return {
                    rich_text: [{
                        type: 'text',
                        text: { content: val.value }
                    }]
                }
            }

            return {
                rich_text: val.value
            }
        }
        
        case 'number': {
            return { number: parseFloat(val.value) }
        }

        case 'select': {
            return {
                select: { name: val.value }
            }
        }

        case 'status': {
            return {
                status: { name: val.value }
            }
        }

        case 'date': {
            if (typeof val.value === 'string') {
                return {
                    date: { start: val.value }
                }
            }
            return {
                date: val.value
            }
        }

        case 'checkbox': {
            let value = val.value
            if (typeof value === 'string') {
                value = value === 'true'
            }
            return {
                checkbox: val.value
            }
        }

        case 'files': {
            let value = val.value
            if (!Array.isArray(value)) {
                value = [value]
            }
            return { files: value }
        }

        case 'url':
        case 'email':
        case 'phone_number':
        case 'multi_select': {
            return { [val.type]: val.value }
        }
    }
}

function createRowFromPage(page) {
    let titleVal = ''
    if (page.object === 'page') {
        const titleProp = Object.values(page.properties).find(prop => prop.type === 'title')
        if (titleProp.title.length > 0) {
            titleVal = titleProp.title[0].text.content
        }
    } else {
        const titleProp = page.title
        if (titleProp && titleProp.length > 0) {
            titleVal = titleProp[0].text.content
        }
    }

    return {
        id: {
            type: 'string',
            value: page.id
        },
        title: {
            type: 'title',
            value: titleVal
        },
        archived: {
            type: 'boolean',
            value: page.archived
        },
        createdBy: {
            type: 'user',
            value: page.created_by ? page.created_by.id : ''
        },
        createdTime: {
            type: 'date',
            value: page.created_time
        },
        lastEditedTime: {
            type: 'date',
            value: page.last_edited_time
        },
        url: {
            type: 'url',
            value: page.url
        },

    }
}

/**
 * 
 * @param {import('./types').TableTypeData} data 
 * @returns {any}
 */
function convertToNotionProperties(data) {
    if (!validateTableTypeData(data)) {
        throw new Error('Non-tabular-type data provided')
    }

    const keys = Object.keys(data)
    const properties = {}
    keys.forEach((key, idx) => {
        const val = data[key]
        properties[key] = getNotionPropertyValue(val)
    })

    return properties
}

module.exports = {
    validateTableTypeData,
    convertToNotionProperties,
    createRowFromPage
}