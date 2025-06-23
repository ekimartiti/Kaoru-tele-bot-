//Script By AbiDev x JulzzDev
// delay cek status jangan diganti biarkan setiap 25detik biar tidak error kalau trx banyak
global.prefa = ['','!','.',',','🐤','🗿']
global.owner = "6282211543299"
global.error = "6282211543299@s.whatsapp.net"
global.creator = "6282211543299@s.whatsapp.net"
global.wang = "0@s.whatsapp.net"
global.ownNumb = "6282211543299"
global.namebot = "Elavate V2"
global.namaowner = "JulzzDev"
global.wm = "JulzzDev"
global.idsal = "12036328903891449@newsletter"
// Api Digital Ocean 
global.digitalocean_apikey = "-" //isi dengan api digital ocean (opsional kalau ga jual vps)
// silahkan ambil di website oke connect kalau codeqr silahkan download qris di order kouta baground merah dan cari scanner qr si chrome
global.merchant = "OK2457295" // wajib
global.codeqr = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214206576903446780303UMI51440014ID.CO.QRIS.WWW0215ID20254096563650303UMI5204541153033605802ID5927WARUNG PIKK STORE OK24572956009BATU BARA61052125262070703A0163040C7F" //wajib
global.keyorkut = "466555517499822122457295OKCTAE0B76D3EA813EBAD2128FE153559C54" //wajib
//harga vps
global.ram1 = '100'
global.ram2 = '100'
global.ram4 = '100'
global.ram8 = '100'
// thumbnail (opsional)
global.thumbpanel = 'https://files.catbox.moe/qsxhlr.jpg'
global.thumbyt = 'https://files.catbox.moe/qsxhlr.jpg'
global.thumbmen = 'https://files.catbox.moe/qsxhlr.jpg'

global.mess = {
    success: 'Success ✓',
    done: 'Success ✓',
    admin: 'Fitur Khusus Admin Group!',
    botAdmin: 'botz Harus Menjadi Admin Terlebih Dahulu!',
    owner: 'Fitur Khusus Owner',
    group: 'Fitur Khusus Group Chat',
    private: 'Fitur Khusus Private Chat!',
    bot: 'Fitur Khusus Nomor Owner',
    wait: 'Sabar ya sedang proses',
    band: 'kamu telah di banned oleh owner\nminta unbanned ke owner agar bisa menggunakan fitur bot lagi',
    notregist: 'Kamu belum terdaftar di database bot silahkan daftar terlebih dahulu',
    premium: 'Kamu Bukan User Premium, Beli Sana Ke Owner Bot',
    error: "*Maaf fitur sedang Error*",
    endLimit: 'Limit Harian Anda Telah Habis, Limit Akan Direset Setiap Pukul 00:00 WIB.',
}
let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})