
var ALREADY_CREATED_IDS = [];

function generate() {
    var id = Math.floor(Math.random() * 10000000);

    if (ALREADY_CREATED_IDS.indexOf(id) === -1 && id !== 0) {
        ALREADY_CREATED_IDS.push(id);
        return id;
    } else {
        return generate();
    }
}

module.exports = {
    generate: generate
};
