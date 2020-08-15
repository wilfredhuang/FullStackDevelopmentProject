module.exports = {
    times: function (n,product, block) {
        var accum = '';
        for (var i = 0; i < n; ++i)
            accum += block.fn(i);
        return product[Number(accum)];
    }
};