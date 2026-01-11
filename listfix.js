// Took base code from @DocilElm, added get, insert, and size methods to CT and .jar

const ListFixInstance = Java.type("com.zephy.listfix2.ListFix2").INSTANCE
const cache = new Map()

export default class ListFixV2 {
    /**
     * - Internal use.
     * - "Reflects" the given field or method and save it in cache
     * - so it doesn't need to scan again to see whether it's a field or a method
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name
     * @returns {number} `1` is `method`. `2` is `field`
     */
    static _reflect(event, name) {
        if (event.class.getDeclaredMethods().some(it => it.getName() === name)) {
            cache.set(name, 1)
            return 1
        }

        if (!event.class.getDeclaredFields().some(it => it.getName() === name)) {
            throw `${name} is not a valid field or method`
        }

        cache.set(name, 2)
        return 2
    }

    /**
     * - Internal use.
     * - Attempts to find the cached methodName
     * @param {string} name
     * @param {string} methodName The method name of which this function was called from
     * @returns {string?} The method to be used for this cached field/method
     */
    static _checkCache(name, methodName) {
        if (!cache.has(name)) return

        return cache.get(name) === 1 ? `${methodName}M` : `${methodName}F`
    }

    /**
     * - Adds a string to the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @param {string} str The string to add to the `List`
     * @returns
     */
    static add(event, name, str) {
        const methodCached = this._checkCache(name, "add")
        if (methodCached) return ListFixInstance[methodCached](event, name, str)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.addM(event, name, str)

        ListFixInstance.addF(event, name, str)
    }

    /**
     * - Sets the value on the given `index` for the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @param {number} idx The index to set the value at
     * @param {string} str The string to set it to
     * @returns
     */
    static set(event, name, idx, str) {
        const methodCached = this._checkCache(name, "set")
        if (methodCached) return ListFixInstance[methodCached](event, name, idx, str)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.setM(event, name, idx, str)

        ListFixInstance.setF(event, name, idx, str)
    }

    /**
     * - Clears the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @returns
     */
    static clear(event, name) {
        const methodCached = this._checkCache(name, "clear")
        if (methodCached) return ListFixInstance[methodCached](event, name)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.clearM(event, name)

        ListFixInstance.clearF(event, name)
    }

    /**
     * - Removes an element at the given `index` from the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @param {number} idx The index to remove the element at
     * @returns
     */
    static removeAt(event, name, idx) {
        const methodCached = this._checkCache(name, "remove")
        if (methodCached) return ListFixInstance[methodCached](event, name, idx)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.removeM(event, name, idx)

        ListFixInstance.removeF(event, name, idx)
    }

    /**
     * - Get an element at the given `index` from the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @param {number} idx The index to get the element at
     * @returns
     */
    static getAt(event, name, idx) {
        const methodCached = this._checkCache(name, "get")
        if (methodCached) return ListFixInstance[methodCached](event, name, idx)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.getM(event, name, idx)

        return ListFixInstance.getF(event, name, idx)
    }

    /**
     * - Inserts an element at the given `index` from the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @param {number} idx The index to insert the element at
     * @param {number} str The string to set it to
     * @returns
     */
    static insert(event, name, idx, str) {
        const methodCached = this._checkCache(name, "insert")
        if (methodCached) return ListFixInstance[methodCached](event, name, idx, str)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.insertM(event, name, idx, str)

        ListFixInstance.insertF(event, name, idx, str)
    }

    /**
     * - Gets the size of the `List`
     * @param {*} event The event to get the `List` from
     * @param {string} name The field/method name (for example `toolTip`)
     * @returns {number} The size of the `List`
     */
    static size(event, name) {
        const methodCached = this._checkCache(name, "size")
        if (methodCached) return ListFixInstance[methodCached](event, name)

        const res = ListFix._reflect(event, name)
        if (res === 1) return ListFixInstance.sizeM(event, name)

        return ListFixInstance.sizeF(event, name)
    }

    /**
     * - Used to pass in reflected methods/fields
     */
    static reflect = {
        /**
         * - Adds a string to the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @param {string} str The string to add to the `List`
         * @returns
         */
        add(event, reflected, str) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.addF(event, reflected, str)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            ListFixInstance.addM(event, reflected, str)
        },

        /**
         * - Sets the value on the given `index` for the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @param {number} idx The index to set the value at
         * @param {string} str The string to set it to
         * @returns
         */
        set(event, reflected, idx, str) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.setF(event, reflected, idx, str)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            ListFixInstance.setM(event, reflected, idx, str)
        },

        /**
         * - Clears the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @returns
         */
        clear(event, reflected) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.clearF(event, reflected)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            ListFixInstance.clearM(event, reflected)
        },

        /**
         * - Removes an element at the given `index` from the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @param {number} idx The index to remove the element at
         * @returns
         */
        removeAt(event, reflected, idx) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.removeF(event, reflected, idx)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            ListFixInstance.removeM(event, reflected, idx)
        },

        /**
         * - Get an element at the given `index` from the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @param {number} idx The index to get the element at
         * @returns
         */
        getAt(event, reflected, idx) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.getF(event, reflected, idx)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            return ListFixInstance.getM(event, reflected, idx)
        },

        /**
         * - Inserts an element at the given `index` from the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @param {number} idx The index to insert the element at
         * @param {string} str The string to insert
         * @returns
         */
        insertAt(event, reflected, idx, str) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.insertF(event, reflected, idx, str)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            ListFixInstance.insertM(event, reflected, idx, str)
        },

        /**
         * - Gets the size of the `List`
         * @param {*} event The event to get the `List` from
         * @param {*} reflected The reflected field/method
         * @returns
         */
        size(event, reflected) {
            if (reflected instanceof java.lang.reflect.Field) return ListFixInstance.sizeF(event, reflected)
            if (!(reflected instanceof java.lang.reflect.Method)) return

            return ListFixInstance.sizeM(event, reflected)
        }
    }
}
