Object.equals = function (first, second) {

    let cache = []; //кеш обьектов, для избежания рекурсии

    function inCache(first, second) {
        var i = cache.length;
        while (i--) if (
            (cache[i][0] === first || cache[i][0] === second) && (cache[i][1] === second || cache[i][1] === first)
        ) return true;
        return false
    }

    return function eq(f, s) {
        if (f === s) return true; //сравниваем обычным образом
        if (f instanceof Date && s instanceof Date) return +f === +s; //время
        if (typeof f !== 'object' || typeof s !== 'object' || s === null || f === null) return false; //если хотябы один из аргументов не объект (положительный случай для необъектов рассмотрен выше)
        if (inCache(f, s)) return true; //есть в кеше
        cache.push([f, s]); //кешируем

        if (Array.isArray(f) !== Array.isArray(s)) return false;
        if (Array.isArray(f)) {
            if (f.length !== s.length) return false;
            let i = f.length;
            while (i--) if (!eq(f[i], s[i])) return false; //рекурсивный вызов
        } else {
            let keys = Object.keys(f), i = keys.length; //получаем ключи
            if (Object.keys(s).length !== i) return false; //если количество ключей не совпадает
            while (i--) if (!eq(f[keys[i]], s[keys[i]])) return false; //рекурсивный вызов
        }
        return true
    }(first, second)
};

