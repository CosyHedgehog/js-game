ENCOUNTERS.sharpen = {
    getText: () => "Use Sharpening Stone",
    getDetails: () => 
        "You find a sharpening stone that can enhance a weapon.\n" +
        "Select one weapon to permanently increase its attack power by 1.\n\n" +
        "Use the sharpening stone?",
    handle: (game, ui) => {
        game.state = 'sharpen';
        game.addLog("You find a sharpening stone. You can use it to enhance a weapon's attack power.");
        ui.showSharpenUI();
    }
}