console.log("=== KWin Screen Detection ===");
console.log("Total screens reported: " + workspace.numScreens);
console.log("Active screen index: " + workspace.activeScreen);

for (var i = 0; i < workspace.numScreens; i++) {
    var fullGeom = workspace.clientArea(KWin.FullScreenArea, i, workspace.currentDesktop);
    console.log("Screen #" + i + " FullScreenArea: " + fullGeom.width + "x" + fullGeom.height + " at " + fullGeom.x + "," + fullGeom.y);
    var workGeom = workspace.clientArea(KWin.WorkArea, i, workspace.currentDesktop);
    console.log("Screen #" + i + " WorkArea:       " + workGeom.width + "x" + workGeom.height + " at " + workGeom.x + "," + workGeom.y);
}
console.log("=== End Screen Detection ===");
