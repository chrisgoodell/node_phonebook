const http = require ('http');

let contacts = [
    { "first":"Chris", "last":"Goodell", "number":"234-567-8901", "id":0 },
    { "first":"Courtney", "last":"Goodell", "number":"345-678-9012", "id":1 },
    { "first":"Henry", "last":"Goodell", "number":"456-789-0123", "id":2 }
];

let contactID = contacts.length + 1;

const putContact = function(request, callback) {
    let body = '';
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        callback(body)
    });
};

const getContact = function (request, response) {
    var urlID = findContactID(request.url);
    contacts.forEach(function (entry) {
        if (entry.id === urlID) {
            response.end(JSON.stringify(entry));
        }
    })
};

const getAllContacts = function (request, response) {
    response.end(JSON.stringify(contacts));
};

const postContact = function (request, response) {
    putContact(request, function(body) {
        var contact = JSON.parse(body);
        contact.id = ++contactID;
        contacts.push(contact);
        response.end('Entry added. ');
    });
};

const updateContact = function (request, response) {
    var urlID = findContactID(request.url);
    putContact(request, function(body) {
        var updateContact = JSON.parse(body);
        contacts.forEach(function(entry, i) {
            if (entry.id === urlID) {
                contacts.splice(i, 1, updateContact)
                response.end('Update successful. ');
            };
        });
    });
};

const deleteContact = function(request, response) {
    var urlID = findContactID(request.url);
    contacts.forEach(function(entry, i) {
        if (entry.id === urlID) {
            contacts.splice(i, 1)
            response.end('Delete successful. ')
        };
    });
};

const findContactID = function(url) {
    return parseInt(url.split('/contacts/')[1], 10)
}

const parseID = function(url) {
    var id = findContactID(url);
    var path = '';
    if (id) {
        path = '/contacts/'
    }
    else {
        path = '/contacts'
    }
    return path;
};

const findRoute = function(method, url) {
    let foundRoute;
    var path = parseID(url);
    routes.forEach(function(route) {
        if (route.method === method && route.path === path) {
            foundRoute = route;
        }
    });
    return foundRoute;
}

const routes = [
    { 
        method: 'GET', 
        path: '/contacts/', 
        handler: getContact
    },
    { 
        method: 'PUT', 
        path: '/contacts/', 
        handler: updateContact
    },
    { 
        method: 'DELETE', 
        path:'/contacts/', 
        handler: deleteContact
    },
    { 
        method: 'GET', 
        path: '/contacts', 
        handler: getAllContacts},
    { 
        method: 'POST', 
        path: '/contacts', 
        handler: postContact
    }
];

const server = http.createServer(function(request, response) {
    const route = findRoute(request.method, request.url);
    if (route) {
        route.handler(request, response);
    }
    else {
        response.end('Communication error. ')
    }
});

server.listen(3000);