ENCOUNTERS.blacksmith = {
    getText: () => "Visit Blacksmith",
    getDetails: () => 
        "Visit the Blacksmith to combine two similar items into a stronger version.\n" +
        "You can combine weapons or armor pieces of the same type.\n\n" +
        "Enter the forge?",
    handle: (game, ui) => {
        game.state = 'blacksmith';
        game.addLog("You find a Blacksmith's forge. The smith offers to combine similar items.");
        ui.showBlacksmithUI();
    }
}