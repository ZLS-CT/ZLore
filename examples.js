import Lore from "ZLore"

register('itemTooltip', (loreList, item, event) => {
    /*
        Uncomment the line below to append a line of lore on every item you hover over that appears after any other mods change the lore.

        Before:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        After:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod
        Hello World

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} newContent - The content to append to the lore
        @param {Boolean} safeMode - If true, will only append one time. If false, will append a new line over and over when you hover over the item.
    */
    // Lore.append(item, "Hello World", true)


    /*
        Uncomment the line below to append a line of lore over and over on every item you hover over that appears after any other mods change the lore.

        Before:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        After:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod
        Hello World
        Hello World
        Hello World
        ...

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} newContent - The content to append to the lore
        @param {Boolean} safeMode - If true, will only append one time. If false, will append a new line over and over when you hover over the item.
    */
    // Lore.append(item, "Hello World", false)


    /*
        Uncomment the line below to append a line of lore on every item you hover over that appears before any other mods change the lore.

        Before:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        After:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Hello World
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} newContent - The content to append to the lore
        @param {Boolean} safeMode - If true, will only append one time. If false, will append a new line over and over when you hover over the item.
    */
    // Lore.appendAfterUnmodified(item, "Hello World", true)


    /*
        Uncomment the line below to insert a line of lore *BEFORE* the item name of every item you hover over.
            - In legacy versions this inserts the line after the item name.

        Before:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        After:
        Hello World
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {Number} index - The index to insert the lore at
        @param {String} newContent - The content to append to the lore
        @param {Boolean} safeMode - If true, will only append one time. If false, will insert a new line over and over when you hover over the item.
    */
    // Lore.insert(item, 0, "Hello World", true)


    /*
        Uncomment the line below to remove the second line of lore of every item you hover over.

        Before:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        After:
        Item Name
        Normal Lore Line 1
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {Number} index - The index to remove at
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.remove(item, 2, true)


    /*
        Uncomment the line below to remove lines that equal "Legendary Sword" on every item you hover over.

        Before:
        Giant Legendary Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Legendary Sword
        Lore Line added by another mod

        After:
        Giant Legendary Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} content - The content to remove from the lore
        @param {Boolean} formatted - If false, will unformat the lore and content before checking for replacements
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.removeLineContent(item, "Legendary Sword", false, true)


    /*
        Uncomment the line below to remove any lines that contains "common" on every item you hover over.

        Before:
        Common Axe
        Normal Lore Line 1
        Normal Lore Line 2
        Common
        Uncommon
        Lore Line added by another mod

        After:
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} content - The content to remove from the lore
        @param {Boolean} formatted - If false, will unformat the lore and content before checking for replacements
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.removeLineContentRegex(item, /common/i, false, true)


    /*
        Uncomment the line below to replace the second line of lore of every item you hover over with "Hello World".

        Before:
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        After:
        Hello World
        Item Name
        Normal Lore Line 1
        Normal Lore Line 2
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {Number} index - The index to replace at
        @param {String} newContent - The new content to replace the lore with
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.replace(item, 2, "Hello World", true)


    /*
        Uncomment the line below to replace lines that equal "legendary sword" on every item you hover over with "Mythic Shovel" colored purple.

        Before:
        Giant Legendary Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Legendary Sword
        Lore Line added by another mod

        After:
        Giant Legendary Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Mythic Shovel
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} contentToReplace - The content to replace from the lore
        @param {String} newContent - The new content to replace the lore with
        @param {Boolean} formatted - If false, will unformat the lore and content before checking for replacements
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.replaceLineContent(item, "Legendary Sword", "§d§lMythic Shovel", false, true)


    /*
        Uncomment the line below to replace any lines that contains "common" on every item you hover over with "Rare".
        - This replaces the entire line, not just the content. Use replaceWord if you want to replace just a word/phrase.

        Before:
        Small Common Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Common Sword
        Lore Line added by another mod

        After:
        Rare
        Normal Lore Line 1
        Normal Lore Line 2
        Rare
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} contentToReplace - The content to replace from the lore
        @param {String} newContent - The new content to replace the lore with
        @param {Boolean} formatted - If false, will unformat the lore and content before checking for replacements
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.replaceLineContentRegex(item, /common/i, "Rare", false, true)


    /*
        Uncomment the line below to replace any occurance of "common" on every item you hover over with "Rare".

        Before:
        Small Common Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Common Sword
        Lore Line added by another mod

        After:
        Small Rare Sword
        Normal Lore Line 1
        Normal Lore Line 2
        Rare Sword
        Lore Line added by another mod

        @param {ItemStack} item - The item stack you are hovering over
        @param {String} contentToReplace - The content to replace from the lore
        @param {String} newContent - The new content to replace the lore with
        @param {Boolean} safeMode - If true, will only replace one time. If false, will replace the lore over and over when you hover over the item.
    */
    // Lore.replaceWord(item, "common", "Rare", true)

    /*
        Uncomment the line below to print the item lore to the chat when you hover over an item.

        @param {ItemStack} item - The item stack you are hovering over
        @param {Boolean} formatted - If false, will remove formatting from the lore before printing it
    */
    // ChatLib.chat(Lore.getLore(item, true))
})
