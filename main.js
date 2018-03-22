var http = require('http');
var fs = require('fs');
var readline = require('readline');
var promisify = require('util').promisify;
var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);
var appendFile = promisify(fs.appendFile);

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var rlQuestion = function(question) {
    return new Promise(function(resolve) {
        rl.question(question, resolve);
    });
};

var lookupEntry = function() {
    var rawData = '';
    rlQuestion('Name: ')
    .then(function(name) {
        http.get('http://localhost:3000/contacts', function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                rawData += chunk;
            });
            res.on('end', function() {
                var contact = JSON.parse(rawData);
                contact.forEach(function(entry) {
                    if (entry.first === name) {
                        console.log(entry);
                        phonebook();
                    }
                })
            })
        })
    })
};

var addNewEntry = function() {
    var entry = '\n';
    rlQuestion('First name: ')
    .then(function(firstName) {
        entry += `${firstName}`
        return rlQuestion('Last name: ')
    })
    .then(function(lastName) {
        entry += ` ${lastName}`
        return rlQuestion('Phone number: ')
    })
    .then(function(phoneNumber) {
        entry += ` ${phoneNumber}`
        return appendFile(phoneBook, entry)
    })
    .then(function() {
        console.log('Entry saved. ')
    })
    .then(function() {
        phonebook();
    })
}

var deleteEntry = function() {
    var phoneList;
    readFile(phoneBook)
    .then(function(data) {
        var stringData = data.toString();
        phoneList = stringData.split("\n")
        return phoneList;
    })
    .then(function() {
        return rlQuestion('Name: ')
    })
    .then(function(name){
        phoneList.forEach(function(entry, i) {
            if (entry.includes(name)) {
                phoneList.splice(i, 1);
                console.log('Entry deleted successfully. ')
            }
    })
        return writeFile(phoneBook, '')
    })
    .then(function() {
        phoneList.forEach(function (entry) {
            appendFile('phonebook.txt', (entry + '\n'))
        })
    })
    .then(function(){
        phonebook();
    })
};

var listEntries = function() {
    var rawData;
    var contactList=[];
    http.get('http://localhost:3000/contacts', function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            rawData += chunk;
        });
        res.on('end', function() {
            var contact = rawData.split('undefined')[1];
            contactList.push(contact)
            var parsedList = JSON.parse(contactList)
            console.log(parsedList);
            phonebook();
        });
    });
};

var phonebook = function() {
    rl.question (`Please make a selection:\n 
    1. Look up an entry\n 
    2. Add new entry\n
    3. Delete an entry\n
    4. List all entries\n
    5. Quit\n`, function(option) {
        var optionNum = Number(option)
        if (optionNum === 1) {
            lookupEntry();
        } 
        else if (optionNum === 2) {
            addNewEntry();
        } 
        else if (optionNum === 3) {
            deleteEntry();
        } 
        else if (optionNum === 4) {
            listEntries();
        } 
        else if (optionNum === 5) {
            rl.close();
        }
    });
};

phonebook();
