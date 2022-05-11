function randomAccess(min, max) {
    return Math.floor(Math.random() * (min - max) + max)
}

function randomHans(nums) {
    let s = ''
    for (let index = 0; index < nums; ++index) {
        s += String.fromCharCode(randomAccess(0x4e00, 0x9fa5))
    }
    return s
}

define(function () {
    return randomHans(500)
})
