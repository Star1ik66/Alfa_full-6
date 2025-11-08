// check.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('Отсканируй QR-код в WhatsApp');
});

client.on('ready', async () => {
    console.log('WhatsApp Client готов');

    const filePath = path.join(__dirname, 'clean_numbers.txt');
    if (!fs.existsSync(filePath)) {
        console.error('Файл clean_numbers.txt не найден');
        process.exit(1);
    }

    const numbers = fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

    const results = [];

    for (const number of numbers) {
        // Формат номера для WhatsApp
        const formatted = number.replace(/\D/g, '') + '@c.us';
        try {
            const isRegistered = await client.isRegisteredUser(formatted);
            results.push(`${number},${isRegistered ? 'ДА' : 'НЕТ'}`);
            console.log(`${number}: ${isRegistered ? 'WhatsApp есть' : 'Нет WhatsApp'}`);
        } catch (e) {
            results.push(`${number},Ошибка`);
            console.error(`Ошибка с ${number}:`, e.message);
        }
    }

    const outPath = path.join(__dirname, 'results.csv');
    fs.writeFileSync(outPath, 'Номер,WhatsApp\n' + results.join('\n'), 'utf-8');

    console.log(`Проверка завершена. Результаты в ${outPath}`);
    process.exit(0);
});

client.initialize();
