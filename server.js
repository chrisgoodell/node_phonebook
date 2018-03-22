const http = require ('http');

let contacts = [
    { "first":"Millie", "last":"Vanilly", "number":"234-567-8901", "id":0 },
    { "first":"Willie", "last":"Nilly", "number":"345-678-9012", "id":1 }
];

let contactID = contacts.length + 1;

const putContact = (request, callback) => {
    let body = '';
    request.on('data', (chunk) => {
        body += chunk.toString();
    });
    request.on('end', () => {
        callback(body)
    });
};

const getContact = (request, response) => {
    let urlID = findContactID(request.url);
    contacts.forEach((entry) => {
        if (entry.id === urlID) {
            response.end(JSON.stringify(entry));
        }
    })
};

const getAllContacts = (request, response) => {
    response.end(JSON.stringify(contacts));
};

const postContact = (request, response) => {
    putContact(request, (body) => {
        let contact = JSON.parse(body);
        contact.id = ++contactID;
        contacts.push(contact);
        response.end('Entry added. ');
    });
};

const updateContact = (request, response) => {
    let urlID = findContactID(request.url);
    putContact(request, (body) => {
        let updateContact = JSON.parse(body);
        contacts.forEach((entry, i) => {
            if (entry.id === urlID) {
                contacts.splice(i, 1, updateContact)
                response.end('Update successful. ');
            };
        });
    });
};

const deleteContact = (request, response) => {
    let urlID = findContactID(request.url);
    contacts.forEach((entry, i) => {
        if (entry.id === urlID) {
            contacts.splice(i, 1)
            response.end('Delete successful. ')
        };
    });
};

const findContactID = (url) => {
    return parseInt(url.split('/contacts/')[1], 10)
};

const parseID = (url) => {
    let id = findContactID(url);
    let path = '';
    if (id) {
        path = '/contacts/'
    }
    else {
        path = '/contacts'
    }
    return path;
};

const findRoute = (method, url) => {
    let foundRoute;
    let path = parseID(url);
    routes.forEach((route) => {
        if (route.method === method && route.path === path) {
            foundRoute = route;
        }
    });
    return foundRoute;
};

let serveIndex = (request, response) => {
    if (request.url === '/') {
        fs.readFile(`static/index.html`, (err, data) => {
            if (err) {
                response.end('404, File Not Found')
            } 
            else {
                response.end(data);
            }
        });
    };
};

let serveFile = (request, response) => {
    fs.readFile(`static/${request.url}`, (err, data) => {
        if (err) {
            response.end('404, File Not Found')
        } 
        else {
            response.end(data);
        }
    });
};

const routes = [
    { 
        method: 'GET', 
        path: /^\/contacts\/([0-9]+)$/, 
        handler: getContact
    },
    { 
        method: 'PUT', 
        path: /^\/contacts\/([0-9]+)$/, 
        handler: updateContact
    },
    { 
        method: 'DELETE', 
        path: /^\/contacts\/([0-9]+)$/, 
        handler: deleteContact
    },
    { 
        method: 'GET', 
        path: /^\/contacts\/?$/,
        handler: getAllContacts
    },
    { 
        method: 'POST', 
        path: /^\/contacts\/?$/,
        handler: postContact
    },
    {   
        method: 'GET', 
        path: /^\/$/, 
        handler: serveIndex 
    },
    {   method: 'GET', 
        path: /^\/[0-9a-zA-Z -.]+\.[0-9a-zA-Z -.]+/, 
        handler: serveFile 
    }
];

const server = http.createServer((request, response) => {
    const route = findRoute(request.method, request.url);
    if (route) {
        route.handler(request, response);
    }
    else {
        response.end('Communication error. ')
    }
});

server.listen(3000);