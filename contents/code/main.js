function log(msg) {
    console.log("VDOnPrimary: " + msg);
}

var busy = false;
var primaryOutputIndex = readConfig("primaryOutputIndex", 0);
var numberOfScreens = readConfig("numberOfScreens", 2);

function isEligible(window) {
    if (!window) {
        return false;
    }
    if (window.specialWindow || window.desktopWindow || window.dock) {
        return false;
    }
    if (!window.normalWindow && window.skipTaskbar) {
        return false;
    }
    if (!window.moveableAcrossScreens) {
        return false;
    }
    return true;
}

function updateWindow(window) {
    var window = window || this;
    if (!isEligible(window)) {
        return;
    }

    if (workspace.numScreens < numberOfScreens) {
        log("Not all screens present (" + workspace.numScreens + "/" + numberOfScreens + "). Not updating.");
        return;
    }

    var currentScreen = window.screen;
    var prevScreen = window.previousScreen;

    if (currentScreen !== primaryOutputIndex) {
        if (!window.onAllDesktops) {
            window.onAllDesktops = true;
            window._pinnedByVdop = true;
            log("Window " + window.caption + " pinned (screen " + currentScreen + ")");
        }
    } else if (window.onAllDesktops) {
        if (window._pinnedByVdop || (prevScreen !== undefined && prevScreen !== primaryOutputIndex)) {
            window.onAllDesktops = false;
            window._pinnedByVdop = false;
            log("Window " + window.caption + " unpinned (primary screen " + currentScreen + ")");
        }
    }
    window.previousScreen = currentScreen;
}

function bindWindow(window) {
    if (!isEligible(window)) {
        return;
    }
    window.previousScreen = window.screen;
    window.screenChanged.connect(window, updateWindow);
    log("Window " + window.caption + " bound");
}

function bindUpdate(window) {
    bindWindow(window);
    updateWindow(window);
}

function updateAll() {
    if (busy) {
        return;
    }
    busy = true;

    if (workspace.numScreens < numberOfScreens) {
        log("Not all screens present. Not updating.");
        busy = false;
        return;
    }

    var clients = workspace.clientList();
    for (var i = 0; i < clients.length; i++) {
        updateWindow(clients[i]);
    }
    busy = false;
}

function scheduleUpdate() {
    var timer = new QTimer();
    timer.interval = 150;
    timer.singleShot = true;
    timer.timeout.connect(updateAll);
    timer.start();
}

function main() {
    log("Starting Virtual Desktops Only On Primary...");
    var clients = workspace.clientList();
    for (var i = 0; i < clients.length; i++) {
        bindWindow(clients[i]);
    }
    scheduleUpdate();

    workspace.clientAdded.connect(bindUpdate);
    workspace.numberScreensChanged.connect(scheduleUpdate);
    workspace.screenResized.connect(scheduleUpdate);
}

main();
