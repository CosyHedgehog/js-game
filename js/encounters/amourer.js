ENCOUNTERS.armourer = {
    getText: () => "Visit Armourer",
    getDetails: () => 
        "You find an Armourer's tools that can enhance armor.\n" +
        "Select one piece of armor to permanently increase its defense by 1.\n\n" +
        "Use the Armourer's tools?",
    handle: (game, ui) => {
        game.state = 'armourer';
        game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
        ui.showArmourerUI();
    }
}