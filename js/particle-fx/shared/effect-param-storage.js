class EffectParamStorage {

    static isObjectDirectlySaveable(obj) {
        return (typeof Range === 'function' && obj instanceof Range)
            || (typeof Color === 'function' && obj instanceof Color)
            || (typeof ColorRange === 'function' && obj instanceof ColorRange)
    }

    static serializeObjectDirectly(obj) {
        if (typeof Range === 'function' && obj instanceof Range)
            return `NUM_RANGE ${obj.min} ${obj.max}`;

        else if (typeof Color === 'function' && obj instanceof Color)
            return obj.toHexString();

        else if (typeof ColorRange === 'function' && obj instanceof ColorRange)
            return `COL_RANGE ${obj.from.toHexString()} ${obj.to.toHexString()}`;

        else
            throw new Error('Attempted to serialize an unknown object.');
    }

    static deserializeObjectDirectly(serialized) {

        if (serialized.startsWith('#')) {
            return Color.fromHex(serialized);

        } else if (serialized.startsWith('NUM_RANGE')) {
            let split = serialized.split(' ');
            return new Range(parseFloat(split[1]), parseFloat(split[2]));

        } else if (serialized.startsWith('COL_RANGE')) {
            let split = serialized.split(' ');
            return new ColorRange(split[1], split[2]);

        } else {
            throw new Error('Attempted to deserialize an unknown object: ', serialized);
        }
    }

    static saveParamsToLocalStorage(name, params) {

        let serializableParams = {}

        function processProp(readParent, writeParent, propName) {

            if (typeof readParent[propName] === 'object') {

                if (EffectParamStorage.isObjectDirectlySaveable(readParent[propName])) {
                    // this object can be directly represented, do not process its properties
                    writeParent[propName] = EffectParamStorage.serializeObjectDirectly(readParent[propName]);
                } else {
                    // object is a parent of other objects
                    writeParent[propName] = {};
                    for (var childPropName in readParent[propName]) {
                        processProp(readParent[propName], writeParent[propName], childPropName);
                    }
                }

            } else {
                // copy property directly
                writeParent[propName] = readParent[propName];
            }
        }

        for (var propName in params) {
            processProp(params, serializableParams, propName);
        }

        localStorage.setItem(name, JSON.stringify(serializableParams));
        console.log(`[ParamStorage] params saved to local storage under name "${name}".`);
    }

    static loadParamsFromLocalStorage(name, defaultParams) {

        let resultParams = localStorage.getItem(name);
        if (!resultParams) {
            console.log('[ParamStorage] params not found in local storage, using default params.');
            return defaultParams;
        }

        try {
            resultParams = JSON.parse(resultParams);
        } catch (e) {
            console.warn('[ParamStorage] could not parse stored params as JSON, using default params.');
            return defaultParams;
        }

        function processProp(defaultParent, resultParent, propName) {

            if (!(propName in resultParent)) {
                console.warn(`[${propName}]: property not in loaded params or loaded type mismatched default type, using default value.`);
                resultParent[propName] = defaultParent[propName];
            } else if (typeof defaultParent[propName] === 'object') {

                if (EffectParamStorage.isObjectDirectlySaveable(defaultParent[propName])) {
                    try {
                        // this object is represented as a string, deserialize directly
                        let deserialized = EffectParamStorage.deserializeObjectDirectly(resultParent[propName]);
                        if (deserialized.constructor.name === defaultParent[propName].constructor.name) {
                            resultParent[propName] = deserialized;
                            console.log(`[${propName}]: deserialized value.`);
                        } else {
                            resultParent[propName] = defaultParent[propName];
                            console.warn(`[${propName}]: deserialized value was of different class than default, using default value.`);
                        }
                    } catch (e) {
                        // in case of failure, use default value
                        resultParent[propName] = defaultParent[propName];
                        console.error(`[${propName}]: ${e}`);
                    }
                } else {
                    // object is a parent of other objects
                    for (var childPropName in defaultParent[propName]) {
                        processProp(defaultParent[propName], resultParent[propName], childPropName);
                    }
                }

            } else {
                // no need to do anything, loaded property is fine as is
                console.log(`[${propName}]: loaded directly from storage.`);
            }
        }

        console.groupCollapsed('[ParamStorage] load log');

        for (var propName in defaultParams) {
            processProp(defaultParams, resultParams, propName);
        }

        console.groupEnd();

        return resultParams;
    }

}