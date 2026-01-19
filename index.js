import { GetJavaClass, isLegacy, getItemStackLore, getCustomDataNBT, getItemStack } from "../ZCore"
import { splitText } from "../ZRenderLib/index"
import * as Mixins from './mixins'
import ListFixV2 from "./listfix"

const DataComponentTypes = GetJavaClass("net.minecraft.component.DataComponentTypes")
const LoreComponent = GetJavaClass("net.minecraft.component.type.LoreComponent")
const NBTComponent = GetJavaClass("net.minecraft.component.type.NbtComponent")
const NBTCompound = GetJavaClass("net.minecraft.nbt.NbtCompound")
const NBTTagString = GetJavaClass("net.minecraft.nbt.NBTTagString")
const System = GetJavaClass("java.lang.System")

const tooltipField = "toolTip"
const HYPIXEL_REGEX = /^(?:[\w-]+\.)?(hypixel\.net)$/

let registeredLoreChanges = {}
let skyblockUUIDCache = {}
let regexCache = {}
let onHypixel = false
let isLoaded = false
let isDebug = false

init()
register("worldUnload", () => { unload() })
register("gameUnload", () => {
    isLoaded = false
    unload()
})

// Catches ct reload
register("gameLoad", () => {
    isLoaded = true
    updateOnHypixel()
})

// Catches normal server joining
register("serverDisconnect", () => { updateOnHypixel() })
register("serverConnect", () => {
    const maxAttempts = 10
    let attempts = 0
    new Thread(() => {
        while (attempts < maxAttempts) {
            if (Server.getIP() != "") {
                updateOnHypixel()
                return
            }
            Thread.sleep(25)
            attempts++
        }
    }).start()
})

function updateOnHypixel() {
    onHypixel = HYPIXEL_REGEX.test(Server.getIP())
}

function unload() {
    updateOnHypixel()
    registeredLoreChanges = {}
    skyblockUUIDCache = {}
    regexCache = {}
}

function parseRegexString(input) {
    if (regexCache.hasOwnProperty(input)) {
        return regexCache[input]
    }

    const regexParts = input.match(/^\/(.*)\/([a-z]*)$/i)
    if (!regexParts) throw new Error("Invalid regex format. Use /pattern/flags")

    const [, pattern, flags] = regexParts
    const regex = new RegExp(pattern, flags)
    regexCache[input] = regex

    return regex
}

function GetTextComponentList(content) {
    if (isLegacy) {
        return content.split("\n")
    }

    let textList = []
    if (content instanceof TextComponent) {
        splitText(content, 512).lines.forEach((line) => {
            textList.push(line)
        })
    } else {
        content.split("\n").forEach((line) => {
            textList.push(new TextComponent(line))
        })
    }
    return textList
}

function applyNonEventLoreChanges(item, moduleName, actionData, safeMode) {
    const itemStack = getItemStack(item)
    const { action, lineIndex, newContent, contentToReplace, priority } = actionData
    if (itemStack == null || action == null || newContent == null || lineIndex == null || priority == null) return

    if (safeMode) {
        registerLoreAction(item, itemStack, moduleName, action, lineIndex, newContent, contentToReplace, priority)
        return true
    }

    return withLoreList(itemStack, action, (loreList) => {
        applyLoreChanges(loreList, actionData, false)
    })
}

function applyLoreChanges(tooltipList, actionData, fromEvent) {
    if (tooltipList == null) return

    let { moduleName, action, lineIndex, newContent, contentToReplace, priority } = actionData
    if (moduleName == null || action == null || newContent == null || lineIndex == null || priority == null) return

    let newContentList = GetTextComponentList(newContent)
    switch (action) {
        case "insert":
            insertByLineIndex(tooltipList, lineIndex, newContentList, fromEvent)
            break
        case "append":
            appendContent(tooltipList, newContentList, fromEvent)
            break
        case "remove":
            removeByLineIndex(tooltipList, lineIndex, fromEvent)
            break
        case "removeContent":
            removeByContent(tooltipList, contentToReplace, true, fromEvent)
            break
        case "removeContentU":
            removeByContent(tooltipList, contentToReplace, false, fromEvent)
            break
        case "removeContentRegex":
            removeByRegex(tooltipList, contentToReplace, true, fromEvent)
            break
        case "removeContentRegexU":
            removeByRegex(tooltipList, contentToReplace, false, fromEvent)
            break
        case "removeAndInsertRegex":
            removeAndInsertRegex(tooltipList, contentToReplace, lineIndex, newContentList, true, fromEvent)
            break
        case "removeAndInsertRegexU":
            removeAndInsertRegex(tooltipList, contentToReplace, lineIndex, newContentList, false, fromEvent)
            break
        case "replaceLine":
            replaceByLineIndex(tooltipList, lineIndex, newContentList, fromEvent)
            break
        case "replaceContent":
            replaceByContent(tooltipList, contentToReplace, newContentList, true, fromEvent)
            break
        case "replaceContentU":
            replaceByContent(tooltipList, contentToReplace, newContentList, false, fromEvent)
            break
        case "replaceContentRegex":
            replaceByRegex(tooltipList, contentToReplace, newContentList, true, fromEvent)
            break
        case "replaceContentRegexU":
            replaceByRegex(tooltipList, contentToReplace, newContentList, false, fromEvent)
            break
        case "replaceWord":
            replaceWord(tooltipList, contentToReplace, newContentList, fromEvent)
            break
        case "replaceOrInsertRegex":
            replaceOrInsertRegex(tooltipList, contentToReplace, lineIndex, newContentList, true, fromEvent)
            break
        case "replaceOrInsertRegexU":
            replaceOrInsertRegex(tooltipList, contentToReplace, lineIndex, newContentList, false, fromEvent)
            break
    }
}

function processFormattedText(line, formatted) {
    if (isLegacy) {
        line = line.toString()
        return (formatted ? line : ChatLib.removeFormatting(line.toLowerCase())).trim()
    }

    const component = new TextComponent(line)
    return (formatted ? component.formattedText.toString() : component.unformattedText.toString().toLowerCase()).trim()
}

function insertByLineIndex(tooltipList, lineIndex, newContentList, fromEvent) {
    newContentList.forEach((newContent, indexOffset) => {
        let newIndex = lineIndex + indexOffset
        if (isLegacy) {
            if (fromEvent) {
                ListFixV2.insert(tooltipList, tooltipField, newIndex, newContent)
                return
            }

            let size = tooltipList.func_74745_c()
            if (newIndex == 0) {
                tooltipList.func_74742_a(new NBTTagString(newContent))
            }
            for (let i = 0; i < size; i++) {
                tooltipList.func_74742_a(new NBTTagString(tooltipList.func_150307_f(i)))
                if (i == newIndex - 1) {
                    tooltipList.func_74742_a(new NBTTagString(newContent))
                }
            }
            for (let i = 0; i < size; i++) {
                tooltipList.func_74744_a(0)
            }
            return
        }

        tooltipList.add(newIndex, newContent)
    })
}

function appendContent(tooltipList, newContentList, fromEvent) {
    newContentList.forEach(newContent => {
        if (isLegacy) {
            if (fromEvent) {
                ListFixV2.add(tooltipList, tooltipField, newContent)
                return
            }

            tooltipList.func_74742_a(new NBTTagString(newContent))
            return
        }

        tooltipList.add(newContent)
    })
}

function removeByLineIndex(tooltipList, lineIndex, fromEvent) {
    if (isLegacy) {
        if (fromEvent) {
            ListFixV2.removeAt(tooltipList, tooltipField, lineIndex)
            return
        }

        tooltipList.func_74744_a(lineIndex)
        return
    }

    tooltipList.remove(lineIndex)
}

function removeByContent(tooltipList, contentToRemove, formatted, fromEvent) {
    if (!formatted) {
        contentToRemove = ChatLib.removeFormatting(contentToRemove.toLowerCase()).trim()
    }

    if (isLegacy) {
        if (fromEvent) {
            let size = ListFixV2.size(tooltipList, tooltipField)
            let indexesToRemove = []
            for (let i = 0; i < size; i++) {
                let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                if (processFormattedText(line, formatted) == contentToRemove) {
                    indexesToRemove.push(i)
                }
            }
            for (let i = indexesToRemove.length - 1; i >= 0; i--) {
                ListFixV2.removeAt(tooltipList, tooltipField, indexesToRemove[i])
            }
            return
        }

        let size = tooltipList.func_74745_c()
        for (let i = 0; i < size; i++) {
            if (processFormattedText(tooltipList.func_150307_f(i), formatted) == contentToRemove) {
                tooltipList.func_74744_a(i)
            }
        }
        return
    }

    tooltipList.removeIf(line => {
        return processFormattedText(line, formatted) == contentToRemove
    })
}

function removeByRegex(tooltipList, regexString, formatted, fromEvent) {
    const regex = parseRegexString(`${regexString}`)

    if (isLegacy) {
        if (fromEvent) {
            let size = ListFixV2.size(tooltipList, tooltipField)
            let indexesToRemove = []
            for (let i = 0; i < size; i++) {
                let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                if (regex.test(processFormattedText(line, formatted))) {
                    indexesToRemove.push(i)
                }
            }
            for (let i = indexesToRemove.length - 1; i >= 0; i--) {
                ListFixV2.removeAt(tooltipList, tooltipField, indexesToRemove[i])
            }
            return
        }

        let size = tooltipList.func_74745_c()
        for (let i = 0; i < size; i++) {
            if (regex.test(processFormattedText(tooltipList.func_150307_f(i), formatted))) {
                tooltipList.func_74744_a(i)
            }
        }
        return
    }

    tooltipList.removeIf(line => {
        return regex.test(processFormattedText(line, formatted))
    })
}

function removeAndInsertRegex(tooltipList, regexString, lineIndex, newContentList, formatted, fromEvent) {
    const regex = parseRegexString(`${regexString}`)
    let foundMatch = false

    if (isLegacy) {
        if (fromEvent) {
            let size = ListFixV2.size(tooltipList, tooltipField)
            for (let i = 0; i < size; i++) {
                let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                if (regex.test(processFormattedText(line, formatted))) {
                    foundMatch = true
                    break
                }
            }
        } else {
            let size = tooltipList.func_74745_c()
            for (let i = 0; i < size; i++) {
                let line = tooltipList.func_150307_f(i)
                if (regex.test(processFormattedText(line, formatted))) {
                    foundMatch = true
                    break
                }
            }
        }
    } else {
        for (let line of tooltipList) {
            if (regex.test(processFormattedText(line, formatted))) {
                foundMatch = true
                break
            }
        }
    }

    if (foundMatch) {
        removeByRegex(tooltipList, regexString, formatted, fromEvent)
    }
    insertByLineIndex(tooltipList, lineIndex, newContentList, fromEvent)
}

function replaceByLineIndex(tooltipList, lineIndex, newContentList, fromEvent) {
    newContentList.forEach((newContent, indexOffset) => {
        let newIndex = lineIndex + indexOffset
        if (isLegacy) {
            if (fromEvent) {
                ListFixV2.set(tooltipList, tooltipField, newIndex, newContent)
                return
            }

            tooltipList.func_150304_a(newIndex, new NBTTagString(newContent))
            return
        }
        tooltipList.set(newIndex, newContent)
    })
}

function replaceByContent(tooltipList, contentToReplace, newContentList, formatted, fromEvent) {
    if (!formatted) {
        contentToReplace = ChatLib.removeFormatting(contentToReplace.toLowerCase()).trim()
    }

    newContentList.forEach(newContent => {
        if (isLegacy) {
            if (fromEvent) {
                let size = ListFixV2.size(tooltipList, tooltipField)
                let indexesToReplace = []
                for (let i = 0; i < size; i++) {
                    let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                    if (processFormattedText(line, formatted) == contentToReplace) {
                        indexesToReplace.push(i)
                    }
                }
                for (let i = 0; i < indexesToReplace.length; i++) {
                    ListFixV2.set(tooltipList, tooltipField, indexesToReplace[i], newContent)
                }
                return
            }

            let size = tooltipList.func_74745_c()
            for (let i = 0; i < size; i++) {
                if (processFormattedText(tooltipList.func_150307_f(i), formatted) == contentToReplace) {
                    tooltipList.func_150304_a(i, new NBTTagString(newContent))
                }
            }
            return
        }

        tooltipList.replaceAll(line => {
            return processFormattedText(line, formatted) == contentToReplace ? newContent : line
        })
    })
}

function replaceByRegex(tooltipList, regexString, newContentList, formatted, fromEvent) {
    const regex = parseRegexString(`${regexString}`)
    newContentList.forEach(newContent => {
        if (isLegacy) {
            if (fromEvent) {
                let size = ListFixV2.size(tooltipList, tooltipField)
                let indexesToReplace = []
                for (let i = 0; i < size; i++) {
                    let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                    if (regex.test(processFormattedText(line, formatted))) {
                        indexesToReplace.push(i)
                    }
                }
                for (let i = 0; i < indexesToReplace.length; i++) {
                    ListFixV2.set(tooltipList, tooltipField, indexesToReplace[i], newContent)
                }
                return
            }
            let size = tooltipList.func_74745_c()
            for (let i = 0; i < size; i++) {
                let line = tooltipList.func_150307_f(i)
                if (regex.test(processFormattedText(line, formatted))) {
                    tooltipList.func_150304_a(i, new NBTTagString(newContent))
                }
            }
            return
        }

        tooltipList.replaceAll(line => {
            return regex.test(processFormattedText(line, formatted)) ? newContent : line
        })
    })
}

function replaceWord(tooltipList, contentToReplace, newContentList, fromEvent) {
    let regexString = contentToReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    let regex = null
    if (regexCache.hasOwnProperty(regexString)) {
        regex = regexCache[regexString]
    } else {
        regex = new RegExp(regexString, "gi")
        regexCache[regexString] = regex
    }

    newContentList.forEach(newContent => {
        if (isLegacy) {
            if (fromEvent) {
                let size = ListFixV2.size(tooltipList, tooltipField)
                for (let i = 0; i < size; i++) {
                    let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                    let text = processFormattedText(line, true)
                    if (regex.test(text)) {
                        ListFixV2.set(tooltipList, tooltipField, i, text.replace(regex, newContent))
                    }
                }
                return
            }

            let size = tooltipList.func_74745_c()
            for (let i = 0; i < size; i++) {
                let line = tooltipList.func_150307_f(i)
                let text = processFormattedText(line, true)
                if (regex.test(text)) {
                    tooltipList.func_150304_a(i, new NBTTagString(text.replace(regex, newContent)))
                }
            }
            return
        }

        tooltipList.replaceAll(line => {
            const text = new TextComponent(line).formattedText.toString()
            return regex.test(text) ? newContent : line
        })
    })
}

function replaceOrInsertRegex(tooltipList, regexString, lineIndex, newContentList, formatted, fromEvent) {
    const regex = parseRegexString(`${regexString}`)
    let foundMatch = false

    if (isLegacy) {
        if (fromEvent) {
            let size = ListFixV2.size(tooltipList, tooltipField)
            for (let i = 0; i < size; i++) {
                let line = ListFixV2.getAt(tooltipList, tooltipField, i)
                if (regex.test(processFormattedText(line, formatted))) {
                    foundMatch = true
                    break
                }
            }
        } else {
            let size = tooltipList.func_74745_c()
            for (let i = 0; i < size; i++) {
                let line = tooltipList.func_150307_f(i)
                if (regex.test(processFormattedText(line, formatted))) {
                    foundMatch = true
                    break
                }
            }
        }
    } else {
        for (let line of tooltipList) {
            if (regex.test(processFormattedText(line, formatted))) {
                foundMatch = true
                break
            }
        }
    }

    if (foundMatch) {
        replaceByRegex(tooltipList, regexString, newContentList, formatted, fromEvent)
        return
    }
    insertByLineIndex(tooltipList, lineIndex, newContentList, fromEvent)
}

function getSkyblockItemUUID(itemStack) {
    let hashCode = `${System.identityHashCode(itemStack)}`
    if (skyblockUUIDCache.hasOwnProperty(hashCode)) {
        return skyblockUUIDCache[hashCode]
    }

    let itemNBT = getCustomDataNBT(itemStack)
    let uuid = null

    if (isLegacy) {
        const extraAttributes = itemNBT.func_74775_l("ExtraAttributes")
        uuid = extraAttributes ? extraAttributes.func_74779_i("uuid") : null
    } else {
        uuid = itemNBT.getString("uuid").orElse(null)
    }

    if (uuid != null) {
        skyblockUUIDCache[hashCode] = uuid
    }
    return uuid
}

export const getItemStack = (item) => {
    if (isLegacy) {
        if (item instanceof com.chattriggers.ctjs.minecraft.wrappers.inventory.Item) {
            return item.itemStack
        }
        return item
    }
    if (item instanceof com.chattriggers.ctjs.api.inventory.Item) {
        return item.mcValue
    }
    return item
}

function loadLoreActions(itemStack) {
    const itemNBT = getCustomDataNBT(itemStack)

    let actions = {}
    if (isLegacy) {
        const loreActions = itemNBT.func_74775_l("loreActions").field_74784_a
        if (loreActions == null) return actions

        let keyList = loreActions.keySet()
        keyList.forEach(key => {
            let loreActionData = loreActions.get(key)
            if (loreActionData == null) return

            let actionData = {
                moduleName: loreActionData.func_74779_i("moduleName"),
                action: loreActionData.func_74779_i("action"),
                lineIndex: loreActionData.func_74762_e("lineIndex"),
                newContent: loreActionData.func_74779_i("newContent"),
                contentToReplace: loreActionData.func_74779_i("contentToReplace"),
                priority: loreActionData.func_74762_e("priority"),
            }

            actions[key] = actionData
        })
        return actions
    }

    const loreActions = itemNBT.getCompound("loreActions").orElse(null)
    if (!loreActions) return actions

    const keyList = loreActions.getKeys().toArray()
    for (const key of keyList) {
        const nbtElement = loreActions.getCompound(key)?.orElse(null)
        if (!nbtElement) continue

        actions[key] = {
            moduleName: nbtElement.getString("moduleName").orElse(null),
            action: nbtElement.getString("action").orElse(null),
            lineIndex: nbtElement.getInt("lineIndex").orElse(null),
            newContent: nbtElement.getString("newContent").orElse(null),
            contentToReplace: nbtElement.getString("contentToReplace").orElse(null),
            priority: nbtElement.getInt("priority").orElse(null),
        }
    }
    return actions
}

function registerLoreAction(item, itemStack, moduleName, action, lineIndex, newContent, contentToReplace, priority) {
    const key = `${moduleName}:${action}:${lineIndex}:${newContent}:${contentToReplace}:${priority}`

    if (onHypixel) {
        let updatedLore = false
        ;(function() {
            const skyblockUUID = getSkyblockItemUUID(itemStack)
            if (skyblockUUID == null) return

            let actions = {}
            if (registeredLoreChanges.hasOwnProperty(skyblockUUID)) {
                actions = registeredLoreChanges[skyblockUUID][moduleName] || {}
                if (actions.hasOwnProperty(key)) {
                    updatedLore = true
                    return
                }
            }

            actions[key] = { moduleName, action, lineIndex, newContent, contentToReplace, priority }
            if (!registeredLoreChanges[skyblockUUID]) {
                registeredLoreChanges[skyblockUUID] = {}
            }
            registeredLoreChanges[skyblockUUID][moduleName] = actions
        }())

        if (updatedLore) return
    }

    let itemNBT = getCustomDataNBT(item)
    let rootTag = null
    let nbtElement = null
    if (isLegacy) {
        rootTag = itemNBT.func_74775_l("loreActions")
        if (rootTag == null) rootTag = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound()).rawNBT
        if (rootTag.func_150297_b(key, 9)) return

        nbtElement = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound())
        nbtElement.setString("moduleName", moduleName)
        nbtElement.setString("action", action)
        nbtElement.setInteger("lineIndex", lineIndex)
        nbtElement.setString("newContent", newContent)
        nbtElement.setString("contentToReplace", contentToReplace)
        nbtElement.setInteger("priority", priority)

        rootTag.func_74782_a(key, nbtElement.rawNBT)
        itemNBT.func_74782_a("loreActions", rootTag)
        return
    }

    rootTag = itemNBT.getCompound("loreActions").orElse(null)
    if (rootTag == null) rootTag = new NBTCompound()

    nbtElement = new NBTCompound()
    nbtElement.putString("moduleName", moduleName)
    nbtElement.putString("action", action)
    nbtElement.putInt("lineIndex", lineIndex)
    nbtElement.putString("newContent", newContent)
    nbtElement.putString("contentToReplace", contentToReplace)
    nbtElement.putInt("priority", priority)

    rootTag.put(key, nbtElement)
    itemNBT.put("loreActions", rootTag)
    itemStack.set(DataComponentTypes.CUSTOM_DATA, NBTComponent.of(itemNBT))
}

function withLoreList(itemStack, methodName, callback) {
    try {
        const loreList = getItemStackLore(itemStack)
        callback(loreList)
        if (!isLegacy) {
            itemStack.set(DataComponentTypes.LORE, new LoreComponent(loreList))
        }
        return true
    } catch (e) {
        if (isDebug) ChatLib.chat(`[${methodName}] Error: ${JSON.stringify(e)}`)
        return false
    }
}

const GetItemStackFromHoverEvent = (event) => {
    let item = null
    let mc = Client.getMinecraft()
    if (mc.currentScreen != null && mc.currentScreen instanceof GuiContainer) {
        let slot = (mc.currentScreen).getSlotUnderMouse()
        if (slot != null) {
            item = slot.getStack()
        }
    }
    if (item == null) {
        item = event.itemStack
    }
    return item
}

function init() {
    function applyLoreActions(itemStack, tooltipList) {
        let actions = null
        if (onHypixel) {
            ;(function() {
                const skyblockUUID = getSkyblockItemUUID(itemStack)
                if (skyblockUUID == null) return

                if (registeredLoreChanges.hasOwnProperty(skyblockUUID)) {
                    actions = {}
                    Object.values(registeredLoreChanges[skyblockUUID]).forEach(moduleActions => {
                        Object.assign(actions, moduleActions)
                    })
                    return
                }
                actions = loadLoreActions(itemStack)
                if (Object.keys(actions).length == 0) return

                registeredLoreChanges[skyblockUUID] = actions
            }())
        }

        if (actions == null) {
            actions = loadLoreActions(itemStack)
        }
        if (Object.keys(actions).length == 0) return

        const actionPriority = { remove: 0, replaceLine: 1, insert: 2 }
        const actionArray = Array.from(Object.values(actions)).sort((a, b) => {
            if (a.priority != b.priority) {
                return a.priority - b.priority
            }

            if (a.moduleName != b.moduleName) {
                return a.moduleName.localeCompare(b.moduleName)
            }

            if (a.lineIndex == -1) return 1
            if (b.lineIndex == -1) return -1

            if (b.lineIndex != a.lineIndex) {
                return b.lineIndex - a.lineIndex
            }

            return (actionPriority[a.action] || 99) - (actionPriority[b.action] || 99)
        })
        actionArray.forEach(actionData => {
            applyLoreChanges(tooltipList, actionData, true)
        })
    }

    if (isLegacy) {
        register(net.minecraftforge.event.entity.player.ItemTooltipEvent, (event) => {
            try {
                let itemStack = GetItemStackFromHoverEvent(event)
                if (itemStack == null) return

                applyLoreActions(itemStack, event)
            } catch (e) {
                if (isDebug) ChatLib.chat(`[GetTooltipForge] Error: ${JSON.stringify(e)}`)
            }
        }).setPriority(Priority.HIGHEST)
        return
    }

    Mixins.itemStack_modifyTooltip.attach((itemStack, callbackInfo, tooltipList) => {
        // Prevents mixin from running when modules are unloaded
        if (!isLoaded) return

        try {
            applyLoreActions(itemStack, tooltipList)
        } catch (e) {
            if (isDebug) ChatLib.chat(`[GetTooltipMixin] Error: ${JSON.stringify(e)}`)
        }
    })
}

export default Lore = {
    insert: function(item, moduleName, lineIndex, newContent, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "insert",
            lineIndex: lineIndex,
            newContent: newContent,
            contentToReplace: "",
            priority: priority,
        }, safeMode)
    },

    // This doesn't work properly in legacy versions, it appends after unmodified lore
    append: function(item, moduleName, newContent, safeMode = true, priority = 0) {
        return this.appendAfterModified(item, moduleName, newContent, safeMode, priority)
    },
    appendAfterModified: function(item, moduleName, newContent, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "append",
            lineIndex: -1,
            newContent: newContent,
            contentToReplace: "",
            priority: priority,
        }, safeMode)
    },
    appendAfterUnmodified: function(item, moduleName, newContent, safeMode = true, priority = 0) {
        // Append in legacy versions already appends after unmodified lore
        if (isLegacy) {
            return this.append(item, moduleName, newContent, safeMode, priority)
        }

        try {
            const currentLore = item.getProcessedLore()
            const insertIndex = currentLore.length + 1 - (safeMode ? 0 : 1)
            return this.insert(item, moduleName, insertIndex, newContent, safeMode, priority)
        } catch (e) {
            if (isDebug) ChatLib.chat(`[AppendAfterUnmodified] Error: ${JSON.stringify(e)}`)
            return false
        }
    },

    remove: function(item, moduleName, lineIndex, safeMode = true, priority = 0) {
        return this.removeLine(item, moduleName, lineIndex, safeMode, priority)
    },
    removeLine: function(item, moduleName, lineIndex, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "remove",
            lineIndex: lineIndex,
            newContent: "",
            contentToReplace: "",
            priority: priority,
        }, safeMode)
    },
    removeLineContent: function(item, moduleName, contentToRemove, formatted, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "removeContent" + (formatted ? "" : "U"),
            lineIndex: -1,
            newContent: "",
            contentToReplace: contentToRemove,
            priority: priority,
        }, safeMode)
    },
    removeLineContentRegex: function(item, moduleName, regexString, formatted, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "removeContentRegex" + (formatted ? "" : "U"),
            lineIndex: -1,
            newContent: "",
            contentToReplace: regexString,
            priority: priority,
        }, safeMode)
    },
    removeAndInsertRegex: function(item, moduleName, regexString, lineIndex, newContent, formatted, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "removeAndInsertRegex" + (formatted ? "" : "U"),
            lineIndex: lineIndex,
            newContent: newContent,
            contentToReplace: regexString,
            priority: priority,
        }, safeMode)
    },

    replace: function(item, moduleName, lineIndex, newContent, safeMode = true, priority = 0) {
        return this.replaceLine(item, moduleName, lineIndex, newContent, safeMode, priority)
    },
    replaceLine: function(item, moduleName, lineIndex, newContent, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "replaceLine",
            lineIndex: lineIndex,
            newContent: newContent,
            contentToReplace: "",
            priority: priority,
        }, safeMode)
    },
    replaceLineContent: function(item, moduleName, contentToReplace, newContent, formatted, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "replaceContent" + (formatted ? "" : "U"),
            lineIndex: -1,
            newContent: newContent,
            contentToReplace: contentToReplace,
            priority: priority,
        }, safeMode)
    },
    replaceLineContentRegex: function(item, moduleName, regexString, newContent, formatted, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "replaceContentRegex" + (formatted ? "" : "U"),
            lineIndex: -1,
            newContent: newContent,
            contentToReplace: regexString,
            priority: priority,
        }, safeMode)
    },
    replaceWord: function(item, moduleName, contentToReplace, newContent, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "replaceWord",
            lineIndex: -1,
            newContent: newContent,
            contentToReplace: contentToReplace,
            priority: priority,
        }, safeMode)
    },
    replaceOrInsertRegex: function(item, moduleName, regexString, lineIndex, newContent, formatted, safeMode = true, priority = 0) {
        return applyNonEventLoreChanges(item, moduleName, {
            action: "replaceOrInsertRegex" + (formatted ? "" : "U"),
            lineIndex: lineIndex,
            newContent: newContent,
            contentToReplace: regexString,
            priority: priority,
        }, safeMode)
    },

    getLore: function(item, formatted = true) {
        const itemStack = getItemStack(item)
        if (itemStack == null) return []
        return getItemStackLore(itemStack, formatted)
    },
    getProcessedLore: function(item, formatted = true) {
        return this.getLore(item, formatted).map(line => {
            return processFormattedText(line, formatted)
        })
    },
    clearAllLoreChanges: function() {
        registeredLoreChanges = {}
    },
    clearModuleLoreChanges: function(moduleName) {
        Object.keys(registeredLoreChanges).forEach(skyblockUUID => {
            if (registeredLoreChanges[skyblockUUID][moduleName]) {
                delete registeredLoreChanges[skyblockUUID][moduleName]
            }
        })
    },
    clearAllItemLoreChanges: function(item) {
        const itemStack = getItemStack(item)
        const skyblockUUID = getSkyblockItemUUID(itemStack)
        registeredLoreChanges[skyblockUUID] = {}
    },
    clearModuleItemLoreChanges: function(moduleName, item) {
        const itemStack = getItemStack(item)
        const skyblockUUID = getSkyblockItemUUID(itemStack)
        if (registeredLoreChanges[skyblockUUID]) {
            delete registeredLoreChanges[skyblockUUID][moduleName]
        }
    }
}
