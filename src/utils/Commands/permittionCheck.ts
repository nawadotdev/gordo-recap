import { Interaction } from "discord.js";
import { permittedUsers } from "../../constants/users";

export const permissionCheck = (interaction: Interaction) => {
    if(permittedUsers.includes(interaction.user.id)){
        return true;
    }
    return false;
}